import React from "react";
import { BulkImportView } from "@/components/problems/BulkImportView";

export const metadata = {
  title: "Import Solved Problems | CodeRev",
  description:
    "Bulk import previously solved LeetCode problems into your personal spaced-repetition deck.",
};

export default function BulkImportPage() {
  return (
    <div className="py-2">
      <BulkImportView />
    </div>
  );
}
