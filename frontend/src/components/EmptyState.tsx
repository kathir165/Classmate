import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-base-raised border border-base-border flex items-center justify-center mb-4">
        <Icon size={22} className="text-ink-faint" strokeWidth={1.75} />
      </div>
      <h3 className="text-ink font-medium mb-1">{title}</h3>
      <p className="text-ink-muted text-sm max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}
