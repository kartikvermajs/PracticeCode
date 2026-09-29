"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Check,
  Calendar,
} from "lucide-react";
import { RecallRating } from "@/services/revision.service";

interface HowDidThisFeelModalProps {
  isOpen: boolean;
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  nextDueSlug?: string | null;
  onClose: () => void;
  onRated?: (rating: RecallRating, interval: number) => void;
}

export function HowDidThisFeelModal({
  isOpen,
  problemId,
  problemSlug,
  problemTitle,
  nextDueSlug,
  onClose,
  onRated,
}: HowDidThisFeelModalProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<RecallRating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    interval: number;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSelectRating = async (rating: RecallRating) => {
    setSelectedRating(rating);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/revision/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          rating,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.calculation) {
        setFeedback({
          interval: data.calculation.interval,
          message: data.message,
        });
        onRated?.(rating, data.calculation.interval);
      }
    } catch {
      setIsSubmitting(false);
      // Fallback local intervals if network fails
      const fallbackInterval = rating === "Difficult" ? 2 : rating === "Good" ? 7 : 14;
      setFeedback({
        interval: fallbackInterval,
        message: `Revision scheduled! Next review in ${fallbackInterval} days.`,
      });
      onRated?.(rating, fallbackInterval);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden p-6 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spaced Repetition Feedback</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How did this feel?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Rate your recall comfort for <strong className="text-slate-800">{problemTitle}</strong> to calculate your optimal revision schedule.
          </p>
        </div>

        {/* 3 Rating Choices */}
        {!feedback ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Difficult (2 days) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectRating("Difficult")}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 text-slate-800 transition-all active:scale-95 group text-center space-y-2 shadow-2xs cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-amber-900">Difficult</p>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800">
                  2 days
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Needed hints or struggled to recall.
              </p>
            </button>

            {/* Good (7 days) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectRating("Good")}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 text-slate-800 transition-all active:scale-95 group text-center space-y-2 shadow-2xs cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-blue-900">Good</p>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
                  7 days
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Recalled with some thought.
              </p>
            </button>

            {/* Easy (14 days) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectRating("Easy")}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 text-slate-800 transition-all active:scale-95 group text-center space-y-2 shadow-2xs cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-emerald-600 fill-emerald-500" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-emerald-900">Easy</p>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                  14 days
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Smooth recall without hesitation.
              </p>
            </button>
          </div>
        ) : (
          /* Confirmation & Next Steps */
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-950">
                Revision Scheduled!
              </h4>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                {feedback.message}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {feedback ? "Done" : "Skip Rating"}
          </button>

          {feedback && nextDueSlug ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/practice/${nextDueSlug}`);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <span>Next Due Problem</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : feedback ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/problems");
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <span>Back to Problems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
