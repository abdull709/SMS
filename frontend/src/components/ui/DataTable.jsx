import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from './Button.jsx';
import { EmptyState } from './EmptyState.jsx';
import { Loader } from './Loader.jsx';

export function DataTable({
  columns,
  rows,
  loading,
  search,
  onSearch,
  meta,
  onPage,
  onEdit,
  onDelete,
  canDelete,
  actions
}) {
  return (
    <div>
      {onSearch ? (
        <div className="border-b border-slate-100 p-4">
          <label className="relative block max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm"
              placeholder="Search records"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
          </label>
        </div>
      ) : null}

      {loading ? <Loader label="Loading records" /> : null}
      {!loading && rows.length === 0 ? <EmptyState /> : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">{column.label}</th>
                ))}
                {(onEdit || onDelete || actions) ? <th className="px-4 py-3 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {column.render ? column.render(row) : row[column.key] ?? '-'}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) ? (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {actions ? actions(row) : null}
                        {onEdit ? (
                          <Button variant="secondary" size="icon" onClick={() => onEdit(row)} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {onDelete && (!canDelete || canDelete(row)) ? (
                          <Button variant="danger" size="icon" onClick={() => onDelete(row)} aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {meta ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Page {meta.page} of {meta.pages} · {meta.total} records</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button variant="secondary" size="sm" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
