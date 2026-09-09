import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, BellRing, Smartphone } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { enablePushNotifications, disablePushNotifications, getPushStatus, type PushStatus } from "../lib/push";
import type { ClassSummary } from "../lib/types";

export default function Settings() {
  const { logout } = useAuth();
  const { refreshClasses, setActiveClassId } = useClasses();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [pushStatus, setPushStatus] = useState<PushStatus>("default");
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    getPushStatus().then(setPushStatus);
  }, []);

  async function handleEnablePush() {
    setPushLoading(true);
    try {
      const status = await enablePushNotifications();
      setPushStatus(status);
      if (status === "subscribed") {
        showToast("Push notifications enabled on this device — you'll get an alert 5 minutes before each class.");
      } else if (status === "denied") {
        showToast("Notifications are blocked. Enable them in your browser's site settings to use reminders.", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't enable push notifications.", "error");
    } finally {
      setPushLoading(false);
    }
  }

  async function handleDisablePush() {
    setPushLoading(true);
    try {
      await disablePushNotifications();
      setPushStatus("not-subscribed");
      showToast("Push notifications turned off on this device.");
    } catch (err) {
      showToast("Couldn't disable push notifications.", "error");
    } finally {
      setPushLoading(false);
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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-ink mb-1 flex items-center gap-2">
                {pushStatus === "subscribed" ? (
                  <BellRing size={16} className="text-good" />
                ) : pushStatus === "denied" ? (
                  <BellOff size={16} className="text-bad" />
                ) : (
                  <Bell size={16} className="text-ink-faint" />
                )}
                Class reminders
              </h3>
              <p className="text-sm text-ink-muted">
                Get a push notification 5 minutes before each of today's classes — on this device,
                even if ClassMate isn't open. Turn this on separately on your phone and your laptop
                to get reminders on both.
              </p>
              <p className="text-xs text-ink-faint mt-2 flex items-center gap-1.5">
                <Smartphone size={13} /> On iPhone/iPad, add ClassMate to your Home Screen first (Share → Add to Home Screen), then enable this from there — iOS only allows push for installed apps.
              </p>
            </div>
          </div>
          <div className="mt-4">
            {pushStatus === "unsupported" ? (
              <p className="text-xs text-ink-faint">This browser doesn't support push notifications.</p>
            ) : pushStatus === "subscribed" ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-good/10 text-good border-good/25">
                  Enabled on this device
                </span>
                <button className="btn-ghost text-xs" onClick={handleDisablePush} disabled={pushLoading}>
                  {pushLoading ? "Turning off…" : "Turn off"}
                </button>
              </div>
            ) : pushStatus === "denied" ? (
              <p className="text-xs text-bad">
                Blocked by your browser. Open your browser's site settings for this page and allow
                notifications, then reload.
              </p>
            ) : (
              <button className="btn-secondary" onClick={handleEnablePush} disabled={pushLoading}>
                <Bell size={16} /> {pushLoading ? "Enabling…" : "Enable class reminders"}
              </button>
            )}
          </div>
        </div>

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
