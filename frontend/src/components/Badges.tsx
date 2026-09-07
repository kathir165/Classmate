export function PriorityBadge({ priority }: { priority: "low" | "normal" | "high" }) {
  const styles = {
    low: "bg-base-raised text-ink-muted border-base-border",
    normal: "bg-accent/10 text-accent border-accent/20",
    high: "bg-bad/10 text-bad border-bad/25",
  }[priority];
  const label = { low: "Low priority", normal: "Announcement", high: "Important" }[priority];
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border ${styles}`}>
      {label}
    </span>
  );
}

export function HomeworkStatusBadge({
  status,
  dueDate,
}: {
  status: "pending" | "completed";
  dueDate: string;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-good/10 text-good border-good/25">
        Completed
      </span>
    );
  }
  const due = new Date(dueDate);
  const now = new Date();
  const isOverdue = due < now;
  const isDueSoon = !isOverdue && due.getTime() - now.getTime() < 1000 * 60 * 60 * 48;

  if (isOverdue) {
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-bad/10 text-bad border-bad/25">
        Overdue
      </span>
    );
  }
  if (isDueSoon) {
    return (
      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-warn/10 text-warn border-warn/25">
        Due soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-base-raised text-ink-muted border-base-border">
      Upcoming
    </span>
  );
}

export function RoleBadge({ role }: { role: "student" | "admin" }) {
  return role === "admin" ? (
    <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-accent/10 text-accent border-accent/20">
      Class Rep
    </span>
  ) : (
    <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md border bg-base-raised text-ink-muted border-base-border">
      Student
    </span>
  );
}
