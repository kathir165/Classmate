import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { ClassSummary } from "../lib/types";

export default function Settings() {
  const { logout } = useAuth();
  const { refreshClasses, setActiveClassId } = useClasses();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { class: joinedClass } = await api.post<{ class: ClassSummary }>("/classes/join", {
        code: code.trim(),
      });
      await refreshClasses();
      setActiveClassId(joinedClass.id);
      showToast("Class joined successfully.");
      setCode("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't join class.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="px-5 md:px-8 pb-10 max-w-lg space-y-5">
        <div className="card p-5">
          <h3 className="font-medium text-ink mb-1">Join another class</h3>
          <p className="text-sm text-ink-muted mb-4">Enter a class code to join a new class.</p>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              className="input uppercase tracking-widest"
              placeholder="ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
            />
            <button type="submit" disabled={loading} className="btn-primary shrink-0">
              {loading ? "Joining…" : "Join"}
            </button>
          </form>
          {error && <p className="text-sm text-bad mt-2">{error}</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-medium text-ink mb-1">Create a new class</h3>
          <p className="text-sm text-ink-muted mb-4">Start another class and become its class representative.</p>
          <button className="btn-secondary" onClick={() => navigate("/onboarding")}>
            Create class
          </button>
        </div>

        <div className="card p-5">
          <h3 className="font-medium text-ink mb-1">Account</h3>
          <p className="text-sm text-ink-muted mb-4">Sign out of ClassMate on this device.</p>
          <button className="btn-secondary text-bad hover:bg-bad/10 border-bad/20" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
