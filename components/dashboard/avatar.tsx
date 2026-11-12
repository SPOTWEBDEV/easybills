export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/10 font-display font-bold text-brand-500"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
