import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      showToast("Welcome back.");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your ClassMate account">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            autoComplete="email"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-glow">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-ink-muted text-center mt-5">
        Don't have an account?{" "}
        <Link to="/signup" className="text-accent hover:text-accent-glow font-medium">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
