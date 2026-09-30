"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a stable QueryClient instance per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep cached data fresh for 5 minutes (prevents repeated database hits)
            staleTime: 5 * 60 * 1000,
            // Keep inactive data in memory for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Prevent noisy background refetches when user switches browser tabs
            refetchOnWindowFocus: false,
            // Retry failed queries once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
