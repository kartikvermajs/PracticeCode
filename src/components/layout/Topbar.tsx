"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  Sparkles,
  Command,
  ExternalLink,
  Flame,
} from "lucide-react";
import { QuickSearchModal } from "../ui/QuickSearchModal";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/problems") return "Problems Library";
    if (pathname.startsWith("/problems/")) return "Problem Details";
    if (pathname.startsWith("/practice/")) return "Practice Session";
    if (pathname === "/due") return "Due for Revision";
    if (pathname === "/history") return "Practice History";
    if (pathname === "/progress") return "Progress & Analytics";
    if (pathname === "/settings") return "Settings";
    return "CodeRev";
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger & Dynamic page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right: Search, Streak, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Streak indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-700 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>14 Day Streak</span>
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100/90 hover:bg-slate-200/70 hover:text-slate-800 rounded-xl transition-colors border border-slate-200/60 shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown / Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Notifications</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    4 Due
                  </span>
                </div>
                <div className="py-3 space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        4 problems due today
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Single Number, Two Sum, Binary Search, Valid Parentheses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center pl-1 sm:pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-blue-100">
              K
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
