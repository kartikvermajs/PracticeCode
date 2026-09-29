import React from "react";
import Link from "next/link";
import { PlusCircle, PlayCircle, BookOpen, Shuffle } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Start Revision",
      description: "Tackle your pending problems due today",
      href: "/revision",
      icon: PlayCircle,
      gradient: "from-blue-600 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600",
      btnText: "Start Now",
      primary: true,
    },
    {
      title: "Practice Random",
      description: "Pick an unexpected challenge from your library",
      href: "/practice/two-sum",
      icon: Shuffle,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-50 text-violet-600",
      btnText: "Random Pick",
      primary: false,
    },
    {
      title: "View Solutions",
      description: "Browse accepted clean templates & notes",
      href: "/problems",
      icon: BookOpen,
      gradient: "from-cyan-500 to-blue-600",
      iconBg: "bg-cyan-50 text-cyan-600",
      btnText: "Explore",
      primary: false,
    },
    {
      title: "Add Problem",
      description: "Record a newly solved LeetCode problem",
      href: "/problems?action=add",
      icon: PlusCircle,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 text-emerald-600",
      btnText: "Add Item",
      primary: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.title}
            href={act.href}
            className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              act.primary
                ? "bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 border-blue-200 shadow-xs"
                : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${act.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {act.primary && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Recommended
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {act.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {act.description}
              </p>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between text-xs font-medium">
              <span
                className={`transition-colors ${
                  act.primary ? "text-blue-600 font-semibold" : "text-slate-600 group-hover:text-slate-900"
                }`}
              >
                {act.btnText} →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
