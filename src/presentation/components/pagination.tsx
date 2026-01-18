interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number | null;
  isLoading: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function Pagination({
  currentPage,
  pageSize,
  total,
  isLoading,
  hasNextPage,
  onPreviousPage,
  onNextPage,
}: PaginationProps) {
  const totalPages = total ? Math.ceil(total / pageSize) : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-sm text-slate-600">
        Página {currentPage}
        {totalPages ? ` de ${totalPages}` : null}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={currentPage <= 1 || isLoading}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
