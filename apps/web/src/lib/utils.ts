import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { subscriptionsService } from "@/services/subscriptions";
import type { Currency, Subscription } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Credit / Income Keyword Helpers ──────────────────────────────────────────

export const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

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

  return CREDIT_KEYWORDS.some(
    (keyword) => titleLower.includes(keyword) || categoryLower.includes(keyword)
  );
}

/** Convert a price to the main currency using exchange rates. */
export function toMainCurrency(price: number, cur: Currency | undefined): number {
  if (!cur || !cur.rate || cur.is_main) return price;
  return price / cur.rate;
}

/** Get the full URL for a subscription logo, or null. */
export function getLogoUrl(sub: Subscription): string | null {
  return subscriptionsService.logoUrl(sub);
}

/** Format a price with a currency symbol. */
export function formatPrice(price: number, symbol: string): string {
  return price.toFixed(2) + " " + symbol;
}

/** Convert a price to monthly based on cycle name and frequency. */
export function toMonthly(price: number, cycleName: string, frequency: number): number {
  const f = frequency || 1;
  const normalizedCycle = (cycleName || "").toLowerCase();
  switch (normalizedCycle) {
    case "one-time": case "onetime": case "once": return price / f;
    case "daily": return (price / f) * 30.44;
    case "weekly": return (price / f) * (52 / 12);
    case "monthly": return price / f;
    case "yearly": return price / (f * 12);
    default: return price;
  }
}

/** Format a date string as localized short date. */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString();
}

/** Days until a date. */
export function daysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Progress percentage between start date and next payment. */
export function subscriptionProgress(startDate: string, nextPayment: string): number {
  if (!startDate || !nextPayment) return 0;
  const [sy, sm, sd] = startDate.slice(0, 10).split("-").map(Number);
  const [ny, nm, nd] = nextPayment.slice(0, 10).split("-").map(Number);
  const start = new Date(sy, sm - 1, sd).getTime();
  const end = new Date(ny, nm - 1, nd).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}
