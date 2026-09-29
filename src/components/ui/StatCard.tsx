import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant: "blue" | "emerald" | "orange" | "violet" | "cyan";
  trend?: {
    label: string;
    positive?: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  trend,
}: StatCardProps) {
  const variantStyles = {
    blue: {
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-200/60",
      accent: "text-blue-600",
      ring: "group-hover:border-blue-300",
    },
    emerald: {
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
      accent: "text-emerald-600",
      ring: "group-hover:border-emerald-300",
    },
    orange: {
      gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
      iconBg: "bg-orange-50 text-orange-600 border border-orange-200/60",
      accent: "text-orange-600",
      ring: "group-hover:border-orange-300",
    },
    violet: {
      gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      iconBg: "bg-violet-50 text-violet-600 border border-violet-200/60",
      accent: "text-violet-600",
      ring: "group-hover:border-violet-300",
    },
    cyan: {
      gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
      iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-200/60",
      accent: "text-cyan-600",
      ring: "group-hover:border-cyan-300",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md",
        style.ring
      )}
    >
      {/* Soft gradient accent in corner */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br blur-xl opacity-70 transition-opacity group-hover:opacity-100",
          style.gradient
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide uppercase text-slate-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  trend.positive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {trend.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className={cn("p-2.5 rounded-xl shadow-xs", style.iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
