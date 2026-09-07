import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Avatar } from "../components/Avatar";
import { RoleBadge } from "../components/Badges";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";

const COLORS = ["#5B7FFF", "#3DCB8F", "#E8A23D", "#E8556B", "#9B6BFF", "#3DC7CB"];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { classes } = useClasses();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch("/users/me", { name, avatarColor });
      await refreshUser();
      showToast("Profile updated.");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Couldn't update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account information" />

      <div className="px-5 md:px-8 pb-10 max-w-lg space-y-5">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || ""} color={avatarColor} size={56} />
            <div>
              <p className="font-medium text-ink">{user?.name}</p>
              <p className="text-sm text-ink-muted">{user?.email}</p>
            </div>
          </div>

          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input opacity-60" value={user?.email || ""} disabled />
            <p className="text-xs text-ink-faint mt-1.5">Email can't be changed here.</p>
          </div>

          <div>
            <label className="label">Avatar color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className="w-7 h-7 rounded-full border-2"
                  style={{ backgroundColor: c, borderColor: c === avatarColor ? "#fff" : "transparent" }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="card p-5">
          <h3 className="font-medium text-ink mb-3">Your classes</h3>
          {classes.length === 0 ? (
            <p className="text-sm text-ink-muted">You haven't joined any classes yet.</p>
          ) : (
            <div className="space-y-2">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-base-raised border border-base-border">
                  <span className="text-sm text-ink">{c.name}</span>
                  <RoleBadge role={c.role} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
