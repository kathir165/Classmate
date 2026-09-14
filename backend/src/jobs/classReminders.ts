import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  timetableEntries,
  subjects,
  classMembers,
  pushSubscriptions,
} from "../db/schema.js";
import { sendPush, pushConfigured } from "../utils/push.js";

const REMINDER_MINUTES_BEFORE = 5;
const CHECK_INTERVAL_MS = 30_000;

// Class timetable timezone.
// Render servers use UTC, so we must explicitly calculate
// the current time in India.
const CLASS_TIME_ZONE = "Asia/Kolkata";

// In-memory guard to prevent duplicate notifications
// while this server instance is running.
const sentToday = new Set<string>();

type LocalNow = {
  dayOfWeek: number;
  nowSeconds: number;
  dateKey: string;
};

function getClassLocalNow(): LocalNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLASS_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekday = get("weekday");

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const second = Number(get("second"));

  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    dayOfWeek: dayMap[weekday],
    nowSeconds: hour * 3600 + minute * 60 + second,
    dateKey: `${year}-${month}-${day}`,
  };
}

async function checkAndSendReminders() {
  if (!pushConfigured) return;

  const { dayOfWeek, nowSeconds, dateKey } = getClassLocalNow();

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
    .innerJoin(
      subjects,
      eq(timetableEntries.subjectId, subjects.id)
    )
    .where(eq(timetableEntries.dayOfWeek, dayOfWeek));

  for (const entry of todaysEntries) {
    const sentKey = `${entry.id}-${dateKey}`;

    if (sentToday.has(sentKey)) continue;

    const [h, m] = entry.startTime.split(":").map(Number);

    const startSeconds = h * 3600 + m * 60;
    const secondsUntilClass = startSeconds - nowSeconds;

    /*
     * We check every 30 seconds.
     *
     * Accept the window from 4 to 5 minutes before class.
     * This makes the scheduler much less likely to miss
     * the exact 5-minute boundary.
     */
    const reminderWindowStart =
      REMINDER_MINUTES_BEFORE * 60 - 60;

    const reminderWindowEnd =
      REMINDER_MINUTES_BEFORE * 60;

    if (
      secondsUntilClass <= 0 ||
      secondsUntilClass < reminderWindowStart ||
      secondsUntilClass > reminderWindowEnd
    ) {
      continue;
    }

    const members = await db
      .select({
        userId: classMembers.userId,
      })
      .from(classMembers)
      .where(eq(classMembers.classId, entry.classId));

    if (members.length === 0) continue;

    const userIds = members.map((member) => member.userId);

    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(inArray(pushSubscriptions.userId, userIds));

    if (subs.length === 0) continue;

    const minutesLeft = Math.max(
      1,
      Math.ceil(secondsUntilClass / 60)
    );

    const payload = {
      title: `${entry.subjectName} starts in ${minutesLeft} min`,
      body:
        [
          entry.teacher,
          entry.room ? `Room ${entry.room}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Get ready!",
      tag: `classmate-${entry.id}-${dateKey}`,
      url: "/timetable",
    };

    const expiredEndpoints: string[] = [];

    await Promise.all(
      subs.map(async (sub) => {
        const result = await sendPush(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );

        if (result.expired) {
          expiredEndpoints.push(sub.endpoint);
        }
      })
    );

    if (expiredEndpoints.length > 0) {
      await db
        .delete(pushSubscriptions)
        .where(
          inArray(
            pushSubscriptions.endpoint,
            expiredEndpoints
          )
        );
    }

    // Only mark it as sent after we actually had subscriptions
    // to process.
    sentToday.add(sentKey);

    console.log(
      `[push] Reminder sent: ${entry.subjectName} in ${minutesLeft} min`
    );
  }
}

export function startClassReminderScheduler() {
  if (!pushConfigured) {
    console.warn(
      "[push] Reminder scheduler not started — VAPID keys are not configured."
    );
    return;
  }

  console.log(
    `[push] Class reminder scheduler started — timezone: ${CLASS_TIME_ZONE}, checking every 30s.`
  );

  checkAndSendReminders().catch((err) =>
    console.error("[push] reminder check failed:", err)
  );

  setInterval(() => {
    checkAndSendReminders().catch((err) =>
      console.error("[push] reminder check failed:", err)
    );
  }, CHECK_INTERVAL_MS);
}
