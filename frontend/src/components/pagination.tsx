import { useState } from "react";

interface PaginationProps {
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = ({
  totalPages = 10,
  initialPage = 1,
  onPageChange,
}: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPages();

  return (
    <div className="flex items-center gap-1.5">
      {/* Prev */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          flex items-center justify-center w-9 h-9 rounded-lg text-sm
          border border-gray-200 bg-white text-gray-600
          hover:bg-gray-50 hover:border-gray-300
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        ←
      </button>

      {/* Pages */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`dots-${i}`}
            className="flex items-center justify-center w-9 h-9 text-sm text-gray-400 select-none"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page)}
            className={`
              flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium
              border transition-all duration-150
              ${
                currentPage === page
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }
            `}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          flex items-center justify-center w-9 h-9 rounded-lg text-sm
          border border-gray-200 bg-white text-gray-600
          hover:bg-gray-50 hover:border-gray-300
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        →
      </button>
    </div>
  );
};