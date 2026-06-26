export function Loader({ label = 'Loading', fullScreen = false }) {
  return (
    <div className={fullScreen ? 'grid min-h-screen place-items-center bg-mist' : 'grid min-h-40 place-items-center'}>
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-school-blue border-t-transparent" />
        {label}
      </div>
    </div>
  );
}
