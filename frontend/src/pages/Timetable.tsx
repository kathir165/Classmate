import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarClock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { TimetableEntry, Subject } from "../lib/types";
import { WEEKDAYS, WEEKDAYS_SHORT } from "../lib/types";

export default function Timetable() {
  const { activeClass } = useClasses();
  const { showToast } = useToast();
  const isAdmin = activeClass?.role === "admin";

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState(new Date().getDay());
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    if (!activeClass) return;
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        api.get<{ timetable: TimetableEntry[] }>(`/classes/${activeClass.id}/timetable`),
        api.get<{ subjects: Subject[] }>(`/classes/${activeClass.id}/subjects`),
      ]);
      setEntries(t.timetable);
      setSubjects(s.subjects);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClass]);

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const dayEntries = entries
    .filter((e) => e.dayOfWeek === dayFilter)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  async function handleDelete() {
    if (!deleteId || !activeClass) return;
    try {
      await api.delete(`/classes/${activeClass.id}/timetable/${deleteId}`);
      setEntries((e) => e.filter((x) => x.id !== deleteId));
      showToast("Timetable entry deleted.");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't delete entry.", "error");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle={activeClass?.name}
        action={
          isAdmin && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add class
            </button>
          )
        }
      />

      <div className="px-5 md:px-8 pb-10">
        {/* Day selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 -mx-1 px-1">
          {WEEKDAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => setDayFilter(idx)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dayFilter === idx
                  ? "bg-accent text-white"
                  : "bg-base-raised text-ink-muted border border-base-border hover:text-ink"
              }`}
            >
              {WEEKDAYS_SHORT[idx]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : dayEntries.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={`No classes on ${WEEKDAYS[dayFilter]}`}
            description={
              isAdmin ? "Add a class to this day to build out the timetable." : "Check another day, or ask your class rep to add classes."
            }
            action={
              isAdmin && (
                <button className="btn-secondary" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Add class
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-2">
            {dayEntries.map((entry) => {
              const subject = subjectById.get(entry.subjectId);
              return (
                <div key={entry.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-center shrink-0 w-16">
                      <p className="text-sm font-medium text-ink">{entry.startTime}</p>
                      <p className="text-xs text-ink-faint">{entry.endTime}</p>
                    </div>
                    <div className="w-px h-8 bg-base-border shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{subject?.name || "Subject"}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {subject?.teacher || "No teacher set"} {entry.room ? `· ${entry.room}` : ""}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className="p-2 rounded-lg text-ink-faint hover:text-bad hover:bg-bad/10 transition-colors shrink-0"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && activeClass && (
        <TimetableFormModal
          classId={activeClass.id}
          subjects={subjects}
          defaultDay={dayFilter}
          onClose={() => setShowForm(false)}
          onCreated={(entry) => {
            setEntries((e) => [...e, entry]);
            setShowForm(false);
            showToast("Class added to timetable.");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete timetable entry"
        description="This will remove the class from the timetable for everyone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function TimetableFormModal({
  classId,
  subjects,
  defaultDay,
  onClose,
  onCreated,
}: {
  classId: string;
  subjects: Subject[];
  defaultDay: number;
  onClose: () => void;
  onCreated: (entry: TimetableEntry) => void;
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [dayOfWeek, setDayOfWeek] = useState(defaultDay);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) {
      setError("Add a subject first before scheduling a class.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { entry } = await api.post<{ entry: TimetableEntry }>(`/classes/${classId}/timetable`, {
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room: room || undefined,
      });
      onCreated(entry);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <form onSubmit={handleSubmit} className="card w-full sm:max-w-md p-5 rounded-b-none sm:rounded-card space-y-4">
        <h3 className="font-display font-semibold text-lg text-ink">Add to timetable</h3>
        {error && (
          <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">{error}</div>
        )}
        {subjects.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No subjects yet. Add a subject first from the Subjects page.
          </p>
        ) : (
          <div>
            <label className="label">Subject</label>
            <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">Day</label>
          <select className="input" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
            {WEEKDAYS.map((d, idx) => (
              <option key={d} value={idx}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start time</label>
            <input type="time" className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className="label">End time</label>
            <input type="time" className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">Room (optional)</label>
          <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={loading || subjects.length === 0} className="btn-primary flex-1">
            {loading ? "Adding…" : "Add class"}
          </button>
        </div>
      </form>
    </div>
  );
}
