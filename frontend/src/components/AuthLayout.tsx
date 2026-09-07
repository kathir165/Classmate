import { Link } from "react-router-dom";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-6 py-12">
      <Link to="/" className="font-display font-bold text-lg text-ink mb-8">
        Class<span className="text-accent">Mate</span>
      </Link>
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display font-semibold text-2xl text-ink">{title}</h1>
          <p className="text-sm text-ink-muted mt-1.5">{subtitle}</p>
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </div>
  );
}
