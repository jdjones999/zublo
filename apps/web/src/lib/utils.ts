import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { subscriptionsService } from "@/services/subscriptions";
import type { Currency, Subscription } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Credit / Income Keyword Helpers ──────────────────────────────────────────

// ✅ CHANGE THIS ARRAY TO INCLUDE MORE OPTIONS:
export const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income", "dividend income", "interest"];

/**
 * Checks if a subscription item is an incoming credit (bonus, dividend, commission, income)
 * rather than a debt or recurring expense. Supports passing a name string or full Subscription object.
 */
export function isCreditItem(item?: string | Subscription | null): boolean {
  if (!item) return false;

  if (typeof item === "string") {
    const normalized = item.toLowerCase().trim();
    return CREDIT_KEYWORDS.some((keyword) => normalized.includes(keyword));
  }

  const titleLower = item.name ? item.name.toLowerCase().trim() : "";
  const categoryName = item.expand?.category?.name ?? "";
  const categoryLower = categoryName.toLowerCase().trim();

  // ✅ ADD THIS LINE to trust the database flag:
  if (item.is_income === true) return true;

  return CREDIT_KEYWORDS.some(
    (keyword) => titleLower.includes(keyword) || categoryLower.includes(keyword)
  );
}

/** (The rest of your utils.ts file stays exactly the same) */
