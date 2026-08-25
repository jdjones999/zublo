import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { subscriptionsService } from "@/services/subscriptions";
import type { Currency, Subscription } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Credit / Income Keyword Helpers ──────────────────────────────────────────

// ONLY the subscription name matters.
// No database flags. No category checks. No exceptions.
export const CREDIT_KEYWORDS = [
  "bonus",
  "dividend",
  "commission",
  "income",
];

/**
 * Checks if a subscription item is an incoming credit.
 *
 * IMPORTANT:
 * This intentionally checks ONLY the subscription name.
 * Category, database flags, and other fields are ignored.
 */
export function isCreditItem(
  item?: string | Subscription | null,
): boolean {
  if (!item) return false;

  // Plain string
  if (typeof item === "string") {
    const normalized = item.toLowerCase().trim();

    return CREDIT_KEYWORDS.some((keyword) =>
      normalized.includes(keyword),
    );
  }

  // Subscription object:
  // ONLY the name is checked.
  const name = item.name?.toLowerCase().trim() ?? "";

  return CREDIT_KEYWORDS.some((keyword) =>
    name.includes(keyword),
  );
}

/**
 * Calculates total monthly expenses while excluding credit items.
 */
export function calculateMonthlyExpenses(
  subscriptions: Subscription[],
): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.inactive || isCreditItem(sub)) {
      return total;
    }

    const cycleName = sub.expand?.cycle?.name ?? "monthly";
    const price = Number(sub.price) || 0;
    const frequency = Number(sub.frequency) || 1;

    return total + toMonthly(price, cycleName, frequency);
  }, 0);
}

/**
 * Calculates total monthly credit income.
 *
 * Credit items are determined ONLY by keywords in the
 * subscription name:
 *
 * - bonus
 * - dividend
 * - commission
 * - income
 */
export function calculateMonthlyCredits(
  subscriptions: Subscription[],
): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.inactive || !isCreditItem(sub)) {
      return total;
    }

    const cycleName = sub.expand?.cycle?.name ?? "monthly";
    const price = Number(sub.price) || 0;
    const frequency = Number(sub.frequency) || 1;

    return total + toMonthly(price, cycleName, frequency);
  }, 0);
}

/** Convert a price to the main currency using exchange rates. */
export function toMainCurrency(
  price: number,
  cur: Currency | undefined,
): number {
  if (!cur || !cur.rate || cur.is_main) {
    return price;
  }

  return price / cur.rate;
}

/** Get the full URL for a subscription logo, or null. */
export function getLogoUrl(sub: Subscription): string | null {
  return subscriptionsService.logoUrl(sub);
}

/** Color palette for calendar chips and charts. */
export const EVENT_COLORS = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
  "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  "bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/30",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30",
];

/** Stable color for a subscription based on its ID hash. */
export function getColorForSub(
  sub: Subscription,
  index: number,
): string {
  const id = sub.id ?? "";

  const hash = id
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return EVENT_COLORS[
    (hash + index) % EVENT_COLORS.length
  ];
}

/**
 * Format a price with a currency symbol.
 */
export function formatPrice(
  price: number,
  symbol: string,
  locale = "en-US",
): string {
  try {
    return (
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price) +
      " " +
      symbol
    );
  } catch {
    return `${Number(price || 0).toFixed(2)} ${symbol}`;
  }
}

/**
 * Convert a price to a monthly amount based on cycle name and frequency.
 *
 * Examples:
 *   $100 monthly  -> $100/month
 *   $100 weekly   -> ~$433.33/month
 *   $100 yearly   -> ~$8.33/month
 *   $100 daily    -> ~$3,044/month
 */
export function toMonthly(
  price: number,
  cycleName: string,
  frequency: number,
): number {
  const amount = Number(price) || 0;
  const f = Number(frequency) || 1;
  const normalizedCycle = (cycleName || "")
    .toLowerCase()
    .trim();

  switch (normalizedCycle) {
    case "one-time":
    case "one time":
    case "onetime":
    case "once":
      return amount / f;

    case "daily":
      return (amount / f) * 30.44;

    case "weekly":
      return (amount / f) * (52 / 12);

    case "monthly":
      return amount / f;

    case "yearly":
    case "annual":
    case "annually":
      return amount / (f * 12);

    default:
      return amount / f;
  }
}

/**
 * Format a date string as a localized short date.
 */
export function formatDate(
  dateStr: string,
  locale = "en-US",
): string {
  if (!dateStr) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parseLocalDate(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Parse a YYYY-MM-DD string as local midnight.
 *
 * This avoids the common JavaScript UTC date-shift problem
 * caused by new Date("YYYY-MM-DD").
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Date(y, m - 1, d);
}

/**
 * Returns a URL only if it uses http or https.
 *
 * Unsafe protocols such as:
 *   javascript:
 *   data:
 *   vbscript:
 *
 * are rejected.
 */
export function sanitizeHref(
  url: string | null | undefined,
): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {
      return url;
    }
  } catch {
    // Invalid URL — reject it.
  }

  return null;
}

/**
 * Returns the number of days until a date.
 *
 * Positive = future
 * Zero = today
 * Negative = past
 */
export function daysUntil(dateStr: string): number {
  if (!dateStr) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = parseLocalDate(dateStr);

  return Math.ceil(
    (target.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
}

/**
 * Returns progress percentage between a start date
 * and the next payment date.
 */
export function subscriptionProgress(
  startDate: string,
  nextPayment: string,
): number {
  if (!startDate || !nextPayment) {
    return 0;
  }

  const start = parseLocalDate(startDate).getTime();
  const end = parseLocalDate(nextPayment).getTime();
  const now = Date.now();

  if (end <= start) {
    return 100;
  }

  const progress =
    ((now - start) / (end - start)) * 100;

  return Math.min(100, Math.max(0, progress));
}
