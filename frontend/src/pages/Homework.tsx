import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ClipboardList, Check } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { HomeworkStatusBadge } from "../components/Badges";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { HomeworkItem, Subject } from "../lib/types";

type Filter = "all" | "pending" | "completed" | "overdue";

export default function Homework() {
  const { activeClass } = useClasses();
  const { showToast } = useToast();

  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    if (!activeClass) return;
    setLoading(true);
    try {
      const [h, s] = await Promise.all([
        api.get<{ homework: HomeworkItem[] }>(`/classes/${activeClass.id}/homework`),
        api.get<{ subjects: Subject[] }>(`/classes/${activeClass.id}/subjects`),
      ]);
      setItems(h.homework);
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

  const filtered = useMemo(() => {
    const now = new Date();
    return items
      .filter((h) => h.title.toLowerCase().includes(query.toLowerCase()))
      .filter((h) => {
        if (filter === "pending") return h.status === "pending";
        if (filter === "completed") return h.status === "completed";
        if (filter === "overdue") return h.status === "pending" && new Date(h.dueDate) < now;
        return true;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [items, filter, query]);

  async function toggleComplete(item: HomeworkItem) {
    if (!activeClass) return;
    const newStatus = item.status === "completed" ? "pending" : "completed";
    setItems((prev) => prev.map((h) => (h.id === item.id ? { ...h, status: newStatus } : h)));
    try {
      await api.patch(`/classes/${activeClass.id}/homework/${item.id}`, { status: newStatus });
      if (newStatus === "completed") showToast("Marked as completed.");
    } catch (err) {
      setItems((prev) => prev.map((h) => (h.id === item.id ? item : h)));
      showToast(err instanceof ApiClientError ? err.message : "Couldn't update homework.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteId || !activeClass) return;
    try {
      await api.delete(`/classes/${activeClass.id}/homework/${deleteId}`);
      setItems((h) => h.filter((x) => x.id !== deleteId));
      showToast("Homework deleted.");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't delete homework.", "error");
    } finally {
      setDeleteId(null);
    }
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Upcoming" },
    { key: "overdue", label: "Overdue" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div>
      <PageHeader
        title="Homework"
        subtitle={activeClass?.name}
        action={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add homework
          </button>
        }
      />

      <div className="px-5 md:px-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-accent text-white"
                    : "bg-base-raised text-ink-muted border border-base-border hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            className="input sm:max-w-xs sm:ml-auto"
            placeholder="Search homework…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={items.length === 0 ? "No homework yet" : "Nothing here"}
            description={items.length === 0 ? "Add homework to start tracking what's due." : "Try a different filter or search."}
            action={
              items.length === 0 && (
                <button className="btn-secondary" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Add homework
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => {
              const subject = item.subjectId ? subjectById.get(item.subjectId) : null;
              return (
                <div key={item.id} className="card p-4 flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete(item)}
                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.status === "completed"
                        ? "bg-good border-good"
                        : "border-base-border hover:border-accent"
                    }`}
                    aria-label="Toggle complete"
                  >
                    {item.status === "completed" && <Check size={13} className="text-white" strokeWidth={3} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${item.status === "completed" ? "text-ink-faint line-through" : "text-ink"}`}>
                        {item.title}
                      </p>
                      <HomeworkStatusBadge status={item.status} dueDate={item.dueDate} />
                    </div>
                    {item.description && (
                      <p className="text-xs text-ink-muted mt-1 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-faint">
                      {subject && <span>{subject.name}</span>}
                      <span>Due {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-1.5 rounded-lg text-ink-faint hover:text-bad hover:bg-bad/10 transition-colors shrink-0"
                    aria-label="Delete homework"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && activeClass && (
        <HomeworkFormModal
          classId={activeClass.id}
          subjects={subjects}
          onClose={() => setShowForm(false)}
          onCreated={(item) => {
            setItems((h) => [...h, item]);
            setShowForm(false);
            showToast("Homework added successfully.");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete homework"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function HomeworkFormModal({
  classId,
  subjects,
  onClose,
  onCreated,
}: {
  classId: string;
  subjects: Subject[];
  onClose: () => void;
  onCreated: (item: HomeworkItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { homework } = await api.post<{ homework: HomeworkItem }>(`/classes/${classId}/homework`, {
        title,
        description: description || undefined,
        dueDate: new Date(dueDate).toISOString(),
        subjectId: subjectId || undefined,
      });
      onCreated(homework);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't add homework.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <form onSubmit={handleSubmit} className="card w-full sm:max-w-md p-5 rounded-b-none sm:rounded-card space-y-4">
        <h3 className="font-display font-semibold text-lg text-ink">Add homework</h3>
        {error && (
          <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">{error}</div>
        )}
        <div>
          <label className="label">Title</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Adding…" : "Add homework"}
          </button>
        </div>
      </form>
    </div>
  );
}
