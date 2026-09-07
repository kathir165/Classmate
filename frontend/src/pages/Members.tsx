import { useEffect, useState } from "react";
import { Users, Copy, Check, UserMinus, ShieldCheck } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CardSkeleton } from "../components/Skeleton";
import { EmptyState } from "../components/EmptyState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Avatar } from "../components/Avatar";
import { RoleBadge } from "../components/Badges";
import { useClasses } from "../context/ClassContext";
import { useAuth } from "../context/AuthContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { Member } from "../lib/types";

export default function Members() {
  const { activeClass } = useClasses();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = activeClass?.role === "admin";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  async function load() {
    if (!activeClass) return;
    setLoading(true);
    try {
      const { members } = await api.get<{ members: Member[] }>(`/classes/${activeClass.id}/members`);
      setMembers(members);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClass]);

  function copyCode() {
    if (!activeClass) return;
    navigator.clipboard.writeText(activeClass.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleRole(member: Member) {
    if (!activeClass) return;
    const newRole = member.role === "admin" ? "student" : "admin";
    try {
      await api.patch(`/classes/${activeClass.id}/members/${member.id}/role`, { role: newRole });
      setMembers((m) => m.map((x) => (x.id === member.id ? { ...x, role: newRole } : x)));
      showToast(`${member.name} is now ${newRole === "admin" ? "a class representative" : "a student"}.`);
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't update role.", "error");
    }
  }

  async function handleRemove() {
    if (!removeId || !activeClass) return;
    try {
      await api.delete(`/classes/${activeClass.id}/members/${removeId}`);
      setMembers((m) => m.filter((x) => x.id !== removeId));
      showToast("Member removed from class.");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't remove member.", "error");
    } finally {
      setRemoveId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Members" subtitle={activeClass?.name} />

      <div className="px-5 md:px-8 pb-10">
        {activeClass && (
          <div className="card p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-ink-faint mb-0.5">Class code</p>
              <p className="font-display font-semibold text-lg tracking-widest text-ink">{activeClass.code}</p>
            </div>
            <button onClick={copyCode} className="btn-secondary">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : members.length === 0 ? (
          <EmptyState icon={Users} title="No members yet" description="Share the class code to invite classmates." />
        ) : (
          <div className="card divide-y divide-base-border">
            {members.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={m.name} color={m.avatarColor} size={38} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {m.name} {m.userId === user?.id && <span className="text-ink-faint font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-ink-faint">
                      Joined {new Date(m.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RoleBadge role={m.role} />
                  {isAdmin && m.userId !== user?.id && (
                    <>
                      <button
                        onClick={() => toggleRole(m)}
                        className="p-1.5 rounded-lg text-ink-faint hover:text-accent hover:bg-accent/10 transition-colors"
                        aria-label="Toggle admin role"
                        title={m.role === "admin" ? "Remove class rep role" : "Make class rep"}
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button
                        onClick={() => setRemoveId(m.id)}
                        className="p-1.5 rounded-lg text-ink-faint hover:text-bad hover:bg-bad/10 transition-colors"
                        aria-label="Remove member"
                      >
                        <UserMinus size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeId}
        title="Remove member"
        description="They'll lose access to this class and will need a new code to rejoin."
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveId(null)}
      />
    </div>
  );
}
