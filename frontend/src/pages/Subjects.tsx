import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { Subject, HomeworkItem } from "../lib/types";

const COLORS = ["#5B7FFF", "#3DCB8F", "#E8A23D", "#E8556B", "#9B6BFF", "#3DC7CB"];

export default function Subjects() {
  const { activeClass } = useClasses();
  const { showToast } = useToast();
  const isAdmin = activeClass?.role === "admin";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function load() {
    if (!activeClass) return;
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        api.get<{ subjects: Subject[] }>(`/classes/${activeClass.id}/subjects`),
        api.get<{ homework: HomeworkItem[] }>(`/classes/${activeClass.id}/homework`),
      ]);
      setSubjects(s.subjects);
      setHomework(h.homework);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClass]);

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.teacher || "").toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteId || !activeClass) return;
    try {
      await api.delete(`/classes/${activeClass.id}/subjects/${deleteId}`);
      setSubjects((s) => s.filter((x) => x.id !== deleteId));
      showToast("Subject deleted.");
      setSelected(null);
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't delete subject.", "error");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle={activeClass?.name}
        action={
          isAdmin && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add subject
            </button>
          )
        }
      />

      <div className="px-5 md:px-8 pb-10">
        <input
          className="input max-w-xs mb-5"
          placeholder="Search subjects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={subjects.length === 0 ? "No subjects yet" : "No matches"}
            description={
              subjects.length === 0
                ? isAdmin
                  ? "Add your first subject to start building the timetable and homework."
                  : "Your class rep hasn't added subjects yet."
                : "Try a different search term."
            }
            action={
              isAdmin &&
              subjects.length === 0 && (
                <button className="btn-secondary" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Add subject
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((subject) => {
              const hwCount = homework.filter((h) => h.subjectId === subject.id && h.status === "pending").length;
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelected(subject)}
                  className="card p-4 text-left hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: subject.colorTag }}
                    />
                    {hwCount > 0 && (
                      <span className="text-xs text-warn bg-warn/10 border border-warn/20 rounded-md px-1.5 py-0.5">
                        {hwCount} due
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-ink truncate">{subject.name}</p>
                  <p className="text-xs text-ink-muted mt-1 truncate">{subject.teacher || "No teacher set"}</p>
                  {subject.room && <p className="text-xs text-ink-faint mt-0.5">{subject.room}</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showForm && activeClass && (
        <SubjectFormModal
          classId={activeClass.id}
          onClose={() => setShowForm(false)}
          onCreated={(subject) => {
            setSubjects((s) => [...s, subject]);
            setShowForm(false);
            showToast("Subject added.");
          }}
        />
      )}

      {selected && (
        <SubjectDetailModal
          subject={selected}
          homework={homework.filter((h) => h.subjectId === selected.id)}
          isAdmin={isAdmin}
          onClose={() => setSelected(null)}
          onDelete={() => setDeleteId(selected.id)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete subject"
        description="This will also remove related timetable entries. Homework will remain but lose its subject tag."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function SubjectFormModal({
  classId,
  onClose,
  onCreated,
}: {
  classId: string;
  onClose: () => void;
  onCreated: (subject: Subject) => void;
}) {
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [colorTag, setColorTag] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { subject } = await api.post<{ subject: Subject }>(`/classes/${classId}/subjects`, {
        name,
        teacher: teacher || undefined,
        room: room || undefined,
        notes: notes || undefined,
        colorTag,
      });
      onCreated(subject);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add subject.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <form onSubmit={handleSubmit} className="card w-full sm:max-w-md p-5 rounded-b-none sm:rounded-card space-y-4">
        <h3 className="font-display font-semibold text-lg text-ink">Add subject</h3>
        {error && (
          <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">{error}</div>
        )}
        <div>
          <label className="label">Subject name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Teacher</label>
          <input className="input" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        </div>
        <div>
          <label className="label">Room</label>
          <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColorTag(c)}
                className="w-7 h-7 rounded-full border-2"
                style={{ backgroundColor: c, borderColor: c === colorTag ? "#fff" : "transparent" }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Adding…" : "Add subject"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SubjectDetailModal({
  subject,
  homework,
  isAdmin,
  onClose,
  onDelete,
}: {
  subject: Subject;
  homework: HomeworkItem[];
  isAdmin: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="card w-full sm:max-w-md p-5 rounded-b-none sm:rounded-card space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.colorTag }} />
            <h3 className="font-display font-semibold text-lg text-ink">{subject.name}</h3>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-faint text-xs mb-0.5">Teacher</p>
            <p className="text-ink">{subject.teacher || "—"}</p>
          </div>
          <div>
            <p className="text-ink-faint text-xs mb-0.5">Room</p>
            <p className="text-ink">{subject.room || "—"}</p>
          </div>
        </div>

        {subject.notes && (
          <div>
            <p className="text-ink-faint text-xs mb-1">Notes</p>
            <p className="text-sm text-ink-muted">{subject.notes}</p>
          </div>
        )}

        <div>
          <p className="text-ink-faint text-xs mb-2">Homework ({homework.length})</p>
          {homework.length === 0 ? (
            <p className="text-sm text-ink-muted">No homework for this subject yet.</p>
          ) : (
            <div className="space-y-1.5">
              {homework.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-base-raised border border-base-border">
                  <span className="text-ink truncate">{h.title}</span>
                  <span className="text-xs text-ink-faint shrink-0 ml-2">
                    {h.status === "completed" ? "Done" : new Date(h.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAdmin && (
          <button onClick={onDelete} className="btn-secondary w-full text-bad hover:bg-bad/10 border-bad/20">
            <Trash2 size={16} /> Delete subject
          </button>
        )}
      </div>
    </div>
  );
}
