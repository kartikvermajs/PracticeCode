"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Filter,
  Plus,
  ArrowUpDown,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { Difficulty, ProblemStatus } from "@/types";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Extract unique topics from mock data
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    MOCK_PROBLEMS.forEach((p) => p.topics.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set).sort()];
  }, []);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return MOCK_PROBLEMS.filter((problem) => {
      // Search matching
      const matchesSearch =
        searchQuery === "" ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.number.toString().includes(searchQuery) ||
        problem.topics.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Difficulty matching
      const matchesDiff =
        selectedDifficulty === "All" ||
        problem.difficulty === selectedDifficulty;

      // Topic matching
      const matchesTopic =
        selectedTopic === "All" || problem.topics.includes(selectedTopic);

      // Status matching
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Due" && problem.isDue) ||
        (selectedStatus === "Solved" && problem.status === "Solved") ||
        (selectedStatus === "Reviewing" && problem.status === "Reviewing");

      return matchesSearch && matchesDiff && matchesTopic && matchesStatus;
    });
  }, [searchQuery, selectedDifficulty, selectedTopic, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedTopic("All");
    setSelectedStatus("All");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Problems
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Your personal LeetCode revision library.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Top Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        {/* Search Bar + Quick clear */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, LeetCode #, or topic tag..."
            className="flex-1"
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === "All" ? "All Topics" : topic}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Due">Due for Review</option>
              <option value="Solved">Solved & Mastered</option>
              <option value="Reviewing">Under Active Review</option>
            </select>

            {(searchQuery ||
              selectedDifficulty !== "All" ||
              selectedTopic !== "All" ||
              selectedStatus !== "All") && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Difficulty Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Difficulty:
          </span>
          {["All", "Easy", "Medium", "Hard"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedDifficulty === diff
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {diff}
            </button>
          ))}

          <span className="text-slate-300 mx-2">|</span>

          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {["All", "Due", "Solved"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedStatus === st
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "Due" ? "⚡ Due Today" : st}
            </button>
          ))}

          <div className="ml-auto text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-700">{filteredProblems.length}</strong> of {MOCK_PROBLEMS.length} problems
          </div>
        </div>
      </div>

      {/* Problems Table / List */}
      {filteredProblems.length === 0 ? (
        <EmptyState
          title="No problems found"
          description="Try relaxing your search terms or filter selections to view available problems."
          actionLabel="Clear all filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 pl-5 pr-3 w-16">#</th>
                  <th className="py-3.5 px-3">Title</th>
                  <th className="py-3.5 px-3">Difficulty</th>
                  <th className="py-3.5 px-3">Topics</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Last Practiced</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProblems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Number */}
                    <td className="py-3.5 pl-5 pr-3 font-mono font-bold text-slate-400 group-hover:text-blue-600">
                      #{problem.number}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-3">
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block text-sm"
                      >
                        {problem.title}
                      </Link>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                    </td>

                    {/* Topics */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {problem.topics.map((t) => (
                          <TopicBadge key={t} topic={t} size="sm" />
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {problem.isDue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Due Today
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Mastered
                        </span>
                      )}
                    </td>

                    {/* Last Practiced */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {problem.lastPracticed}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/problems/${problem.slug}`}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          View Solution
                        </Link>
                        <Link
                          href={`/practice/${problem.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all active:scale-95"
                        >
                          <span>Practice</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Problem Modal (Visual Shell) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Add Solved Problem
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  LeetCode Problem Title / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15. 3Sum or https://leetcode.com/problems/3sum/"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Two Pointers"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Accepted Solution Code
                </label>
                <textarea
                  rows={4}
                  placeholder="// Paste your clean accepted solution here"
                  className="w-full font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Problem added to revision deck! (Foundation Mock Mode)");
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Save Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
