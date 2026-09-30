"use client";

import React, { useState, useEffect } from "react";
import {
  getRandomMessage,
  getAnyRandomMessage,
  AMBIENT_MESSAGES,
  AFTER_SAVE_MESSAGES,
  STREAK_MESSAGES,
  DUE_TODAY_MESSAGES,
  HARD_PROBLEM_MESSAGES,
  type MotivationalMessage,
} from "@/data/motivational-messages";
import { MotivationalBanner } from "@/components/ui/MotivationalBanner";

type Pool = "ambient" | "afterSave" | "streak" | "dueToday" | "hardProblem" | "any";

interface RandomMotivationalCardProps {
  pool?: Pool;
  variant?: "subtle" | "card" | "inline";
  className?: string;
}

const POOL_MAP: Record<Pool, MotivationalMessage[]> = {
  ambient: AMBIENT_MESSAGES,
  afterSave: AFTER_SAVE_MESSAGES,
  streak: STREAK_MESSAGES,
  dueToday: DUE_TODAY_MESSAGES,
  hardProblem: HARD_PROBLEM_MESSAGES,
  any: [], // handled separately
};

/**
 * Drop-in client component that picks and displays a random motivational
 * message from the requested pool on every mount.
 */
export function RandomMotivationalCard({
  pool = "any",
  variant = "card",
  className = "",
}: RandomMotivationalCardProps) {
  const [message, setMessage] = useState<MotivationalMessage | null>(null);

  useEffect(() => {
    if (pool === "any") {
      setMessage(getAnyRandomMessage());
    } else {
      setMessage(getRandomMessage(POOL_MAP[pool]));
    }
  }, [pool]);

  if (!message) return null;

  return <MotivationalBanner message={message} variant={variant} className={className} />;
}
