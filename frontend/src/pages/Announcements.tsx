import { useEffect, useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PriorityBadge } from "../components/Badges";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { Announcement } from "../lib/types";

export default function Announcements() {
  const { activeClass } = useClasses();
  const { showToast } = useToast();
  const isAdmin = activeClass?.role === "admin";

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    if (!activeClass) return;
    setLoading(true);
    try {
      const { announcements } = await api.get<{ announcements: Announcement[] }>(
        `/classes/${activeClass.id}/announcements`
      );
      setItems(announcements);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClass]);

  async function handleDelete() {
    if (!deleteId || !activeClass) return;
    try {
      await api.delete(`/classes/${activeClass.id}/announcements/${deleteId}`);
      setItems((a) => a.filter((x) => x.id !== deleteId));
      showToast("Announcement deleted.");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't delete announcement.", "error");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle={activeClass?.name}
        action={
          isAdmin && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> New announcement
            </button>
          )
        }
      />

      <div className="px-5 md:px-8 pb-10 max-w-2xl">
        {loading ? (
          <div className="space-y-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description={isAdmin ? "Post an update for your classmates to see." : "Your class rep hasn't posted anything yet."}
            action={
              isAdmin && (
                <button className="btn-secondary" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> New announcement
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div
                key={a.id}
                className={`card p-5 ${a.priority === "high" ? "border-bad/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <PriorityBadge priority={a.priority} />
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="text-ink-faint hover:text-bad transition-colors"
                      aria-label="Delete announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <h3 className="font-medium text-ink mb-1.5">{a.title}</h3>
                <p className="text-sm text-ink-muted whitespace-pre-wrap">{a.message}</p>
                <p className="text-xs text-ink-faint mt-3">
                  {new Date(a.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && activeClass && (
        <AnnouncementFormModal
          classId={activeClass.id}
          onClose={() => setShowForm(false)}
          onCreated={(item) => {
            setItems((a) => [item, ...a]);
            setShowForm(false);
            showToast("Announcement published.");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete announcement"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function AnnouncementFormModal({
  classId,
  onClose,
  onCreated,
}: {
  classId: string;
  onClose: () => void;
  onCreated: (item: Announcement) => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { announcement } = await api.post<{ announcement: Announcement }>(
        `/classes/${classId}/announcements`,
        { title, message, priority }
      );
      onCreated(announcement);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't publish announcement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <form onSubmit={handleSubmit} className="card w-full sm:max-w-md p-5 rounded-b-none sm:rounded-card space-y-4">
        <h3 className="font-display font-semibold text-lg text-ink">New announcement</h3>
        {error && (
          <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">{error}</div>
        )}
        <div>
          <label className="label">Title</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input resize-none" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">Important</option>
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
