import React, { Suspense } from "react";
import { getProblemsLibrary } from "@/lib/db-queries";
import { ProblemsLibraryView } from "@/components/problems/ProblemsLibraryView";
import ProblemsLoading from "./loading";

export const dynamic = "force-dynamic";

interface ProblemsPageProps {
  searchParams: Promise<{
    q?: string;
    difficulty?: string;
    tag?: string;
    status?: string;
    revision?: string;
    page?: string;
  }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const resolvedParams = await searchParams;

  const page = parseInt(resolvedParams.page || "1", 10);
  const q = resolvedParams.q || "";
  const difficulty = resolvedParams.difficulty || "All";
  const tag = resolvedParams.tag || "All";
  const status = resolvedParams.status || "All";
  const revision = resolvedParams.revision || "All";

  // Fetch real data directly from the Problem database table
  const data = await getProblemsLibrary({
    q,
    difficulty,
    tag,
    status,
    revision,
    page,
    limit: 10,
  });

  return (
    <Suspense fallback={<ProblemsLoading />}>
      <ProblemsLibraryView data={data} />
    </Suspense>
  );
}
