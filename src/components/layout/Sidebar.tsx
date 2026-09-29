"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  ClockAlert,
  History,
  TrendingUp,
  Settings,
  Code2,
  Sparkles,
  User,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const primaryNav = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      name: "Problems",
      href: "/problems",
      icon: Layers,
      badge: "82",
    },
    {
      name: "Due for Revision",
      href: "/due",
      icon: ClockAlert,
      badge: "4 due",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      name: "Practice History",
      href: "/history",
      icon: History,
      badge: undefined,
    },
  ];

  const secondaryNav = [
    {
      name: "Progress",
      href: "/progress",
      icon: TrendingUp,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-white border-r border-slate-200/80 select-none">
      {/* Logo Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                CodeRev
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-600 text-[10px] font-semibold">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight">
              DSA Revision Lab
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        <div>
          <p className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main
          </p>
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                    active
                      ? "bg-blue-50/90 text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full",
                        item.badgeColor || (active ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600")
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            System
          </p>
          <nav className="space-y-1">
            {secondaryNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                    active
                      ? "bg-blue-50/90 text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Spaced Repetition status banner */}
      <div className="px-3.5 pb-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/60 border border-violet-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Spaced Repetition</span>
          </div>
          <p className="text-[11px] text-violet-700 mt-1">
            4 problems due today. Keep your recall sharp!
          </p>
        </div>
      </div>

      {/* Bottom User Profile Card */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              K
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Kartik
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                DSA Revision
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
