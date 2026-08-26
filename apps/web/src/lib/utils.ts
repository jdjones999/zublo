import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { subscriptionsService } from "@/services/subscriptions";
import type { Currency, Subscription } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ⚠️ THIS IS THE ONLY LINE THAT MATTERS
export const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function isCreditItem(item?: string | Subscription | null): boolean {
  if (!item) return false;
  
  if (typeof item === "string") {
    return item.toLowerCase().includes("bonus") ||
           item.toLowerCase().includes("dividend") ||
           item.toLowerCase().includes("commission") ||
           item.toLowerCase().includes("income");
  }

  const name = item.name ? item.name.toLowerCase() : "";
  const catName = item.expand?.category?.name?.toLowerCase() || "";
  
  return name.includes("bonus") || name.includes("dividend") ||
         name.includes("commission") || name.includes("income") ||
         catName.includes("bonus") || catName.includes("dividend") ||
         catName.includes("commission") || catName.includes("income");
}
