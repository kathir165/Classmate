import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { api, ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/request-password-reset", { email });
      setStep("confirm");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, resetCode, newPassword });
      showToast("Password updated. Log in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "confirm") {
    return (
      <AuthLayout title="Enter your code" subtitle={`We sent a 6-digit code to ${email}`}>
        <form onSubmit={handleConfirm} className="space-y-4">
          {error && (
            <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="code">
              Reset code
            </label>
            <input
              id="code"
              required
              maxLength={6}
              className="input tracking-widest text-center"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <label className="label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Updating…" : "Reset password"}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password" subtitle="We'll send a reset code to your email">
      <form onSubmit={handleRequest} className="space-y-4">
        {error && (
          <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? "Sending…" : "Send reset code"}
        </button>
      </form>
      <p className="text-sm text-ink-muted text-center mt-5">
        <Link to="/login" className="text-accent hover:text-accent-glow font-medium">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}
