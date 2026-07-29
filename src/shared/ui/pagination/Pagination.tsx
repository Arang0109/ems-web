import {
  Pagination as PaginationPrimitive,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@shared/ui/primitives";

interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (pageIndex: number) => void;
}

function getPageNumbers(pageIndex: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const pages: (number | 'ellipsis')[] = [];
  const current = pageIndex;

  pages.push(0);

  if (current > 3) pages.push('ellipsis');

  for (let i = Math.max(1, current - 1); i <= Math.min(pageCount - 2, current + 1); i++) {
    pages.push(i);
  }

  if (current < pageCount - 4) pages.push('ellipsis');

  pages.push(pageCount - 1);

  return pages;
}

export const Pagination = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: PaginationProps) => {
  if (pageCount <= 1) return null;

  const pages = getPageNumbers(pageIndex, pageCount);

  return (
    <PaginationPrimitive>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); onPreviousPage(); }}
            aria-disabled={!canPreviousPage}
            className={!canPreviousPage ? 'pointer-events-none opacity-50' : ''}
            text="이전"
          />
        </PaginationItem>

        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === pageIndex}
                onClick={(e) => { e.preventDefault(); onPageChange(page); }}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); onNextPage(); }}
            aria-disabled={!canNextPage}
            className={!canNextPage ? 'pointer-events-none opacity-50' : ''}
            text="다음"
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationPrimitive>
  );
};
