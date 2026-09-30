"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardData, ProblemsLibraryResult, ProblemsFilterOptions } from "@/lib/db-queries";

export const QUERY_KEYS = {
  dashboard: ["dashboard"] as const,
  problems: (params?: ProblemsFilterOptions) => ["problems", params] as const,
  problem: (slug: string) => ["problem", slug] as const,
};

/**
 * TanStack query hook for Dashboard data with cache retention
 */
export function useDashboardQuery(initialData?: DashboardData) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: async (): Promise<DashboardData> => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
  });
}

/**
 * TanStack query hook for Problems Library with filter cache
 */
export function useProblemsLibraryQuery(
  params: ProblemsFilterOptions = {},
  initialData?: ProblemsLibraryResult
) {
  return useQuery({
    queryKey: QUERY_KEYS.problems(params),
    queryFn: async (): Promise<ProblemsLibraryResult> => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.difficulty) searchParams.set("difficulty", params.difficulty);
      if (params.tag) searchParams.set("tag", params.tag);
      if (params.status) searchParams.set("status", params.status);
      if (params.revision) searchParams.set("revision", params.revision);
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));

      const res = await fetch(`/api/problems?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch problems");
      return res.json();
    },
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Client helper hook to invalidate TanStack caches after mutations
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateDashboard: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard }),
    invalidateProblems: () =>
      queryClient.invalidateQueries({ queryKey: ["problems"] }),
    invalidateProblem: (slug: string) =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.problem(slug) }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}

