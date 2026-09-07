export function Avatar({
  name,
  color = "#5B7FFF",
  size = 36,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.4,
      }}
    >
      {initials || "?"}
    </div>
  );
}
