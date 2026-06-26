import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No records found', description = 'Try adjusting filters or add a new record.' }) {
  return (
    <div className="grid min-h-56 place-items-center p-8 text-center">
      <div>
        <Inbox className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-3 text-base font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
