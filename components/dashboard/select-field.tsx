export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="block flex-1 space-y-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-full border bg-[rgb(var(--bg-elevated))] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[rgb(var(--fg))] outline-none focus:border-brand-500">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
