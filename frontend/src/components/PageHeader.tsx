export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 md:px-8 pt-6 md:pt-8 pb-5">
      <div className="min-w-0">
        <h1 className="font-display font-semibold text-xl md:text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
