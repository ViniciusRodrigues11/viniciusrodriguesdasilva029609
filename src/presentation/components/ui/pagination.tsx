import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number | null;
  isLoading: boolean;
  hasNextPage: boolean;

  scrollContainerRef?: React.RefObject<HTMLElement>;
  scrollContainerSelector?: string;
  bottomThresholdPx?: number;

  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
}

type PageItem = number | "…";

export function Pagination({
  currentPage,
  pageSize,
  total,
  isLoading,
  hasNextPage,
  onPreviousPage,
  onNextPage,
  onPageChange,
  scrollContainerRef,
  scrollContainerSelector = "main.overflow-y-auto",
  bottomThresholdPx = 100,
}: PaginationProps) {
  const totalPages =
    total !== null ? Math.max(1, Math.ceil(total / pageSize)) : null;

  const derivedHasNextPage =
    totalPages !== null ? currentPage < totalPages : hasNextPage;

  const [isAtBottom, setIsAtBottom] = useState(false);

  const pageNumbers: PageItem[] = useMemo(() => {
    if (totalPages === null) return [];

    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) set.add(p);

    const sorted = Array.from(set).sort((a, b) => a - b);

    const out: PageItem[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const prev = sorted[i - 1];

      if (i > 0 && prev !== undefined && p - prev > 1) out.push("…");
      out.push(p);
    }

    return out;
  }, [currentPage, totalPages]);

  useEffect(() => {
    const scrollContainer =
      scrollContainerRef?.current ??
      (document.querySelector(scrollContainerSelector) as HTMLElement | null);

    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      setIsAtBottom(distanceFromBottom < bottomThresholdPx);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, scrollContainerSelector, bottomThresholdPx]);

  return (
    <nav
      aria-label="Paginação"
      className={`flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all ${
        !isAtBottom
          ? "fixed bottom-4 left-1/2 z-40 w-[90%] -translate-x-1/2 shadow-md md:sticky md:bottom-4 md:left-auto md:translate-x-0 md:max-w-md self-end"
          : "relative w-full shadow-sm mt-4 md:mt-0"
      }`}
    >
      <div
        className="text-sm text-slate-600"
        aria-live="polite"
        aria-atomic="true"
      >
        Página {currentPage}
        {totalPages !== null ? ` de ${totalPages}` : null}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Ir para página ${currentPage - 1}`}
          onClick={onPreviousPage}
          disabled={currentPage <= 1 || isLoading}
          className="rounded-md border cursor-pointer border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ChevronLeft className="inline-block h-4 w-4" aria-hidden="true" />
        </button>

        {pageNumbers.map((item, index) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={isLoading || item === currentPage}
              aria-current={item === currentPage ? "page" : undefined}
              className={`min-w-9 rounded-md border px-2.5 py-1.5 text-sm font-medium transition ${
                item === currentPage
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              }`}
            >
              {item}
            </button>
          ) : (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="px-1 text-slate-400"
            >
              {item}
            </span>
          ),
        )}

        <button
          type="button"
          aria-label={`Ir para página ${currentPage + 1}`}
          onClick={onNextPage}
          disabled={!derivedHasNextPage || isLoading}
          className="rounded-md border cursor-pointer border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ChevronRight className="inline-block h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
