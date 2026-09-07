import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { ApiClientError } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      showToast("Account created.");
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Set up ClassMate for your class">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-bad bg-bad/10 border border-bad/25 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
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
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-xs text-ink-faint mt-1.5">At least 8 characters.</p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-ink-muted text-center mt-5">
        Already have an account?{" "}
        <Link to="/login" className="text-accent hover:text-accent-glow font-medium">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
