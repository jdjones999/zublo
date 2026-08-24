import { useMemo } from "react";
import type { Subscription } from "@/types";

const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function useSummaryData(subscriptions: Subscription[] = []) {
  return useMemo(() => {
    let totalMonthly = 0;
    let totalBonusCredits = 0;

    subscriptions.forEach((sub) => {
      // Skip inactive subscriptions
      if (sub.inactive) return;

      // Extract subscription name safely and normalize
      const subName = sub.name || "";
      const nameLower = subName.toLowerCase().trim();

      // Check if item name contains any credit/income keyword
      const isCredit = CREDIT_KEYWORDS.some((kw) => nameLower.includes(kw));

      // Resolve cycle name across direct properties and expanded PocketBase relations
      const cycleName = (
        sub.expand?.cycle?.name ||
        sub.billing_cycle ||
        sub.cycle ||
        "monthly"
      )
        .toString()
        .toLowerCase();

      const frequency = sub.frequency || 1;
      const rawPrice = sub.price || 0;
      let monthlyCost = rawPrice;

      // Normalize cost to monthly equivalent
      if (cycleName.includes("year")) {
        monthlyCost = (rawPrice / 12) / frequency;
      } else if (cycleName.includes("week")) {
        monthlyCost = (rawPrice * 4.33) / frequency;
      } else if (cycleName.includes("day")) {
        monthlyCost = (rawPrice * 30) / frequency;
      } else if (cycleName.includes("month")) {
        monthlyCost = rawPrice / frequency;
      }

      // Add to credit buffer or regular monthly expense debt
      if (isCredit) {
        totalBonusCredits += monthlyCost;
      } else {
        totalMonthly += monthlyCost;
      }
    });

    return {
      totalMonthly,
      totalBonusCredits,
      totalYearly: totalMonthly * 12,
      totalWeekly: totalMonthly / 4.33,
      totalDaily: totalMonthly / 30,
    };
  }, [subscriptions]);
}
