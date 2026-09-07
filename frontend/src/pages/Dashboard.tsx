import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ClipboardList, Megaphone, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { PriorityBadge, HomeworkStatusBadge } from "../components/Badges";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";
import { api } from "../lib/api";
import type { TimetableEntry, HomeworkItem, Announcement, Subject, Member } from "../lib/types";
import { WEEKDAYS } from "../lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const { activeClass } = useClasses();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [hw, setHw] = useState<HomeworkItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeClass) return;
    setLoading(true);
    Promise.all([
      api.get<{ timetable: TimetableEntry[] }>(`/classes/${activeClass.id}/timetable`),
      api.get<{ subjects: Subject[] }>(`/classes/${activeClass.id}/subjects`),
      api.get<{ homework: HomeworkItem[] }>(`/classes/${activeClass.id}/homework`),
      api.get<{ announcements: Announcement[] }>(`/classes/${activeClass.id}/announcements`),
      api.get<{ members: Member[] }>(`/classes/${activeClass.id}/members`),
    ])
      .then(([t, s, h, a, m]) => {
        setTimetable(t.timetable);
        setSubjects(s.subjects);
        setHw(h.homework);
        setAnnouncements(a.announcements);
        setMembers(m.members);
      })
      .finally(() => setLoading(false));
  }, [activeClass]);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const now = new Date();
  const todayIdx = now.getDay();
  const todaysClasses = timetable
    .filter((t) => t.dayOfWeek === todayIdx)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nowStr = now.toTimeString().slice(0, 5);
  const nextClass = todaysClasses.find((t) => t.startTime >= nowStr) || null;
  const currentClass = todaysClasses.find((t) => t.startTime <= nowStr && t.endTime > nowStr) || null;

  const upcomingHomework = hw
    .filter((h) => h.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const importantAnnouncements = announcements.filter((a) => a.priority === "high").slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      <PageHeader
        title={`Hi ${user?.name.split(" ")[0]}`}
        subtitle={now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      />

      <div className="px-5 md:px-8 pb-10 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={CalendarClock} label="Classes today" value={todaysClasses.length} />
          <StatCard icon={ClipboardList} label="Homework pending" value={hw.filter((h) => h.status === "pending").length} />
          <StatCard icon={Megaphone} label="Announcements" value={announcements.length} />
          <StatCard icon={Users} label="Classmates" value={members.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Current / next class */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-ink">Today's timetable</h2>
              <Link to="/timetable" className="text-xs text-accent hover:text-accent-glow flex items-center gap-1">
                View full timetable <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : todaysClasses.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No classes today"
                description="Enjoy the free day, or check the full week view."
              />
            ) : (
              <div className="space-y-2">
                {todaysClasses.map((entry) => {
                  const subject = subjectById.get(entry.subjectId);
                  const isCurrent = currentClass?.id === entry.id;
                  const isNext = !currentClass && nextClass?.id === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-lg border ${
                        isCurrent
                          ? "bg-accent/10 border-accent/30"
                          : isNext
                          ? "bg-base-raised border-accent/20"
                          : "bg-base-raised border-base-border"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrent ? "text-accent" : "text-ink"}`}>
                          {subject?.name || "Subject"}
                          {isCurrent && <span className="ml-2 text-xs font-normal">· Now</span>}
                          {isNext && <span className="ml-2 text-xs font-normal text-ink-faint">· Next</span>}
                        </p>
                        <p className="text-xs text-ink-faint mt-0.5">
                          {subject?.teacher || "—"} {entry.room ? `· ${entry.room}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-ink-muted shrink-0 ml-3">
                        {entry.startTime}–{entry.endTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-ink">Announcements</h2>
              <Link to="/announcements" className="text-xs text-accent hover:text-accent-glow">
                See all
              </Link>
            </div>
            {loading ? (
              <CardSkeleton />
            ) : recentAnnouncements.length === 0 ? (
              <EmptyState icon={Megaphone} title="No announcements yet" description="Class updates will show up here." />
            ) : (
              <div className="space-y-3">
                {(importantAnnouncements.length > 0 ? importantAnnouncements : recentAnnouncements).map((a) => (
                  <div key={a.id} className="border-b border-base-border last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={a.priority} />
                    </div>
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming homework */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-ink">Upcoming homework</h2>
            <Link to="/homework" className="text-xs text-accent hover:text-accent-glow flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <CardSkeleton />
          ) : upcomingHomework.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nothing due" description="You're all caught up on homework." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {upcomingHomework.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3.5 py-3 rounded-lg bg-base-raised border border-base-border">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{item.title}</p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      Due {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <HomeworkStatusBadge status={item.status} dueDate={item.dueDate} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card p-4">
      <Icon size={16} className="text-ink-faint mb-2" />
      <p className="font-display font-semibold text-xl text-ink">{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </div>
  );
}
