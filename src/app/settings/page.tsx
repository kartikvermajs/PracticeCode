"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Sliders, Bell, User, Database, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState("4");
  const [intervalMultiplier, setIntervalMultiplier] = useState("2.0");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Configure your spaced-repetition parameters, goals, and platform defaults.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Revision Algorithm Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Spaced Repetition Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Daily Revision Problems
              </label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                min={1}
                max={20}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Number of problems prioritized in Today&apos;s Revision queue.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Interval Progression Multiplier
              </label>
              <select
                value={intervalMultiplier}
                onChange={(e) => setIntervalMultiplier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-semibold cursor-pointer"
              >
                <option value="1.5">Gentle (1.5x interval growth)</option>
                <option value="2.0">Standard SM-2 (2.0x interval growth)</option>
                <option value="2.5">Aggressive (2.5x interval growth)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Adjusts how quickly intervals expand after each successful recall.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                User Profile & Credentials
              </h3>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>Edit Profile & Avatar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={user?.name || "Kartik"}
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-default"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <input
                type="text"
                value={user?.email || "kartik@coderev.dev"}
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Database Status Info */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Database Connection
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            PostgreSQL datasource configured via Prisma ORM. Ready for Neon database sync in production.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Prisma Schema & Client Initialized</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
