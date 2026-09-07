import { Link } from "react-router-dom";
import {
  CalendarClock,
  ClipboardList,
  BookOpen,
  Megaphone,
  Users,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Timetable",
    text: "See today's classes at a glance, with the next one always highlighted.",
  },
  {
    icon: BookOpen,
    title: "Subjects",
    text: "Every subject in one place — teacher, room, notes, and homework together.",
  },
  {
    icon: ClipboardList,
    title: "Homework",
    text: "Track what's due, what's done, and what's overdue without digging through chats.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    text: "Class reps post updates once. Everyone sees them, pinned by priority.",
  },
  {
    icon: Users,
    title: "Classmates",
    text: "Know who's in your class and who to ask when you're stuck.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <span className="font-display font-bold text-lg text-ink">
          Class<span className="text-accent">Mate</span>
        </span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-ink text-balance">
          Everything your class needs, in one place.
        </h1>
        <p className="mt-5 text-ink-muted text-lg max-w-xl mx-auto">
          ClassMate keeps timetables, subjects, homework, and announcements organized —
          so your class runs on one shared source of truth instead of five group chats.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary px-6 py-3 text-base">
            Get started <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">
            Log in
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="card p-2 sm:p-3">
          <div className="rounded-lg bg-base overflow-hidden border border-base-border">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-base-border">
              <div className="p-5">
                <p className="text-xs text-ink-faint mb-3">Today, Monday</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">Data Structures</span>
                    <span className="text-ink-faint">9:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm px-2 py-1.5 -mx-2 rounded-md bg-accent/10">
                    <span className="text-accent font-medium">Linear Algebra</span>
                    <span className="text-accent">11:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">Digital Systems</span>
                    <span className="text-ink-faint">2:00 PM</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-ink-faint mb-3">Homework due soon</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink">Algorithms problem set</span>
                    <span className="text-warn text-xs">Tomorrow</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink">Circuits lab report</span>
                    <span className="text-ink-faint text-xs">Fri</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-ink-faint mb-3">Announcements</p>
                <p className="text-sm text-ink">Midterm moved to Thursday, Room 204.</p>
                <p className="text-xs text-ink-faint mt-3">Posted by Class Rep</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display font-semibold text-2xl text-ink mb-8 text-center">
          Built around how a class actually runs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <f.icon size={17} className="text-accent" />
              </div>
              <h3 className="font-medium text-ink mb-1">{f.title}</h3>
              <p className="text-sm text-ink-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display font-semibold text-2xl text-ink mb-3">Ready when your class is.</h2>
        <p className="text-ink-muted mb-6">Create a class in seconds, or join one with a code.</p>
        <Link to="/signup" className="btn-primary px-6 py-3 text-base inline-flex">
          Get started <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-base-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display font-semibold text-ink">
            Class<span className="text-accent">Mate</span>
          </span>
          <p className="text-xs text-ink-faint">© {new Date().getFullYear()} ClassMate. Built for students.</p>
        </div>
      </footer>
    </div>
  );
}
