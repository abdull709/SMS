export function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-school-rose">{error}</span> : null}
    </label>
  );
}

export function inputClass() {
  return 'focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400';
}
