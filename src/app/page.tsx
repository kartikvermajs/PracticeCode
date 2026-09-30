import React from "react";
import { getDashboardData } from "@/lib/db-queries";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardView initialData={data} />;
}
