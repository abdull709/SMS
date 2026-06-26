export function StatCard({ label, value, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-school-blue',
    green: 'bg-emerald-50 text-school-green',
    amber: 'bg-amber-50 text-school-amber',
    rose: 'bg-rose-50 text-school-rose'
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        {Icon ? (
          <div className={`grid h-12 w-12 place-items-center rounded-lg ${tones[tone]}`}>
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
