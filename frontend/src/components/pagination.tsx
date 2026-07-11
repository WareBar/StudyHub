import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";

interface PaginationData {
  next: string | null;
  previous: string | null;
  count: number;
}

interface PaginatorProps {
  data: PaginationData;
  setPageUrl: (url: string) => void;
  onNext: () => void;
  onPrev: () => void;
  pageSize?: number; // optional override
}

export function Paginator({
  data,
  setPageUrl,
  onNext,
  onPrev,
  pageSize = 10,
}: PaginatorProps) {

  // guard if no data
  if (!data) return null;

  const hasNext = !!data.next;
  const hasPrev = !!data.previous;

  // extract base API link safely
  const baseLink =
    data.next?.split("?")[0] ??
    data.previous?.split("?")[0] ??
    "";

  // total pages
  const totalPages = Math.ceil(data.count / pageSize);

  // generate page numbers
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination>
      <PaginationContent>

        {/* PREVIOUS */}
        <PaginationItem>
          <PaginationPrevious
            onClick={onPrev}
            className={!hasPrev ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* PAGE NUMBERS */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setPageUrl(`${baseLink}?page=${page}`)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* NEXT */}
        <PaginationItem>
          <PaginationNext
            onClick={onNext}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}