"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Code2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProblemModal({ isOpen, onClose }: AddProblemModalProps) {
  const router = useRouter();

  const [leetcodeId, setLeetcodeId] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeId: parseInt(leetcodeId, 10),
          title: title.trim(),
          difficulty,
          tags: tags ? tags.split(",").map((t) => t.trim()) : ["Algorithms"],
          url: url.trim() || undefined,
          description: description.trim() || undefined,
          solutionCode: solutionCode.trim() || undefined,
          solutionLanguage: "typescript",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add problem.");
      }

      setSuccessMessage(data.message || "Problem added successfully!");
      router.refresh();

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        // Reset form
        setLeetcodeId("");
        setTitle("");
        setTags("");
        setUrl("");
        setDescription("");
        setSolutionCode("");
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Add Solved Problem to Revision Deck
            </h3>
            <p className="text-xs text-slate-500">
              Save a problem to your database to start tracking spaced repetition intervals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                LeetCode # <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={leetcodeId}
                onChange={(e) => setLeetcodeId(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Problem Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-semibold cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Array, Hash Table"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              LeetCode Problem URL (optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/two-sum/"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Problem Description / Note
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of problem prompt or core constraints..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Accepted Solution Code (optional)
            </label>
            <textarea
              rows={4}
              value={solutionCode}
              onChange={(e) => setSolutionCode(e.target.value)}
              placeholder="// Paste your accepted solution here..."
              className="w-full font-mono text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Problem</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
