"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProblemsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function ProblemsPagination({
  page,
  totalPages,
  total,
  limit,
}: ProblemsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Generate page numbers array (with ellipsis if large)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs font-semibold">
      <div className="text-slate-500">
        Showing <span className="font-bold text-slate-800">{startIdx}</span> to{" "}
        <span className="font-bold text-slate-800">{endIdx}</span> of{" "}
        <span className="font-bold text-slate-800">{total}</span> problems
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page Button */}
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || isPending}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                disabled={isPending}
                className={`w-8 h-8 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || isPending}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
