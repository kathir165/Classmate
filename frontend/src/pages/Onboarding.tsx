import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { ClassSummary } from "../lib/types";

export default function Onboarding() {
  const { user, logout } = useAuth();
  const { classes, refreshClasses, setActiveClassId } = useClasses();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function afterJoinOrCreate(classId: string) {
    await refreshClasses();
    setActiveClassId(classId);
    navigate("/dashboard");
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { class: newClass } = await api.post<{ class: ClassSummary }>("/classes", {
        name: className,
        description: description || undefined,
      });
      showToast(`Class created — code is ${newClass.code}`);
      await afterJoinOrCreate(newClass.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { class: joinedClass } = await api.post<{ class: ClassSummary }>("/classes/join", {
        code: code.trim(),
      });
      showToast("Class joined successfully.");
      await afterJoinOrCreate(joinedClass.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6 py-12">
      <span className="font-display font-bold text-lg text-ink mb-2">
        Class<span className="text-accent">Mate</span>
      </span>
      <p className="text-sm text-ink-muted mb-8">
        Hi {user?.name.split(" ")[0]}, {classes.length > 0 ? "add another class" : "let's get you set up"}.
      </p>

      <div className="w-full max-w-sm">
        {mode === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="card w-full p-5 text-left hover:border-accent/40 transition-colors flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Plus size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-ink">Create a class</p>
                <p className="text-sm text-ink-muted mt-0.5">
                  Start a new class and become its class representative.
                </p>
              </div>
            </button>
            <button
              onClick={() => setMode("join")}
              className="card w-full p-5 text-left hover:border-accent/40 transition-colors flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Users size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-medium text-ink">Join a class</p>
                <p className="text-sm text-ink-muted mt-0.5">Use a class code shared by your class rep.</p>
              </div>
            </button>
            {classes.length > 0 && (
              <button onClick={() => navigate("/dashboard")} className="btn-ghost w-full mt-2">
                Skip for now
              </button>
            )}
            <button onClick={logout} className="btn-ghost w-full text-xs">
              Log out
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-ink">Create a class</h2>
            {error && (
              <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="className">
                Class name
              </label>
              <input
                id="className"
                required
                className="input"
                placeholder="e.g. CS 301 — Fall 2026"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                className="input resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setMode("choose")}>
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Creating…" : "Create class"}
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-ink">Join a class</h2>
            {error && (
              <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}
            <div>
              <label className="label" htmlFor="code">
                Class code
              </label>
              <input
                id="code"
                required
                className="input uppercase tracking-widest text-center"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setMode("choose")}>
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? "Joining…" : "Join class"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
