export interface PaginationState {
  page: number;
  pageSize: number;
  total: number | null;
}

export function clampPage(page: number, total: number | null, pageSize: number): number {
  if (total == null) return Math.max(1, page);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.max(1, Math.min(page, totalPages));
}

export function calculateHasNextPage(
  currentPage: number,
  pageSize: number,
  total: number | null,
  currentItemsCount: number
): boolean {
  if (total != null && total > 0) {
    const totalPages = Math.ceil(total / pageSize);
    return currentPage < totalPages;
  }
  return currentItemsCount >= pageSize;
}
