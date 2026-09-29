import React from "react";
import { AddProblemForm } from "@/components/problems/AddProblemForm";

export const metadata = {
  title: "Add Problem | CodeRev",
  description: "Manually add a LeetCode problem to your spaced repetition revision deck.",
};

export default function NewProblemPage() {
  return (
    <div className="py-2">
      <AddProblemForm />
    </div>
  );
}
