import { eq, and, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { timetableEntries, subjects, classMembers, pushSubscriptions } from "../db/schema.js";
import { sendPush, pushConfigured } from "../utils/push.js";

const REMINDER_MINUTES_BEFORE = 5;
const CHECK_INTERVAL_MS = 60_000; // once a minute is enough precision for a 5-minute-out reminder

// In-memory guard against sending the same reminder twice from this process
// within the same day. Resets naturally when the key's date rolls over.
// Note: in a horizontally-scaled (multi-instance) deployment, replace this
// with a DB or Redis-backed lock so two instances don't double-send.
const sentToday = new Set<string>();

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function checkAndSendReminders() {
  if (!pushConfigured) return;

  const now = new Date();
  const todayIdx = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const dateKey = todayDateKey();

  // Every entry scheduled for today.
  const todaysEntries = await db
    .select({
      id: timetableEntries.id,
      classId: timetableEntries.classId,
      subjectId: timetableEntries.subjectId,
      startTime: timetableEntries.startTime,
      room: timetableEntries.room,
      subjectName: subjects.name,
      teacher: subjects.teacher,
    })
    .from(timetableEntries)
    .innerJoin(subjects, eq(timetableEntries.subjectId, subjects.id))
    .where(eq(timetableEntries.dayOfWeek, todayIdx));

  for (const entry of todaysEntries) {
    const sentKey = `${entry.id}-${dateKey}`;
    if (sentToday.has(sentKey)) continue;

    const [h, m] = entry.startTime.split(":").map(Number);
    const startMinutes = h * 60 + m;
    const reminderMinutes = startMinutes - REMINDER_MINUTES_BEFORE;

    // Fire once we're in the 5-minute window (and haven't already fired).
    if (nowMinutes < reminderMinutes || nowMinutes >= startMinutes) continue;

    sentToday.add(sentKey);

    const members = await db
      .select({ userId: classMembers.userId })
      .from(classMembers)
      .where(eq(classMembers.classId, entry.classId));
    if (members.length === 0) continue;

    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(inArray(pushSubscriptions.userId, members.map((m) => m.userId)));
    if (subs.length === 0) continue;

    const minutesLeft = startMinutes - nowMinutes;
    const payload = {
      title: `${entry.subjectName} starts in ${minutesLeft} min`,
      body: [entry.teacher, entry.room ? `Room ${entry.room}` : null].filter(Boolean).join(" · ") || "Get ready!",
      tag: `classmate-${entry.id}-${dateKey}`,
      url: "/timetable",
    };

    const expiredEndpoints: string[] = [];
    await Promise.all(
      subs.map(async (sub) => {
        const result = await sendPush(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        if (result.expired) expiredEndpoints.push(sub.endpoint);
      })
    );

    if (expiredEndpoints.length > 0) {
      await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, expiredEndpoints));
    }
  }
}

export function startClassReminderScheduler() {
  if (!pushConfigured) {
    console.warn("[push] Reminder scheduler not started — VAPID keys are not configured.");
    return;
  }
  console.log("[push] Class reminder scheduler started (checking every 60s).");
  checkAndSendReminders().catch((err) => console.error("[push] reminder check failed:", err));
  setInterval(() => {
    checkAndSendReminders().catch((err) => console.error("[push] reminder check failed:", err));
  }, CHECK_INTERVAL_MS);
}
