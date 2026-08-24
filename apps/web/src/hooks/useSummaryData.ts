import { useMemo } from "react";
import type { Subscription } from "@/types";

const CREDIT_TYPES = ["bonus", "dividend", "commission", "income"];

export function useSummaryData(subscriptions: Subscription[] = []) {
  return useMemo(() => {
    let totalMonthly = 0;
    let totalBonusCredits = 0;

    subscriptions.forEach((sub) => {
      if (sub.inactive) return;

      const titleLower = sub.name ? sub.name.toLowerCase().trim() : "";
      const categoryName = sub.expand?.category?.name
        ? sub.expand.category.name.toLowerCase().trim()
        : "";

      const cycleName = (
        sub.expand?.cycle?.name ||
        sub.billing_cycle ||
        sub.cycle ||
        "monthly"
      )
        .toString()
        .toLowerCase()
        .trim();

      const frequency = sub.frequency || 1;
      const rawPrice = sub.price || 0;

      // Check Category OR Title against Credit Keywords
      const isCreditCategoryOrTitle = CREDIT_TYPES.some(
        (type) => titleLower.includes(type) || categoryName.includes(type)
      );

      // Check for Cycle = "One-Time" and Frequency = 1
      const isOneTime =
        cycleName.includes("one") || cycleName.includes("once") || cycleName === "one-time";

      const isCreditItem = isCreditCategoryOrTitle && isOneTime && frequency === 1;

      if (isCreditItem) {
        // Exclude completely from recurring G() / monthly cost calculation
        totalBonusCredits += rawPrice;
        return;
      }

      // Calculate standard recurring monthly cost
      let monthlyCost = rawPrice;
      if (cycleName.includes("year")) {
        monthlyCost = rawPrice / (12 * frequency);
      } else if (cycleName.includes("week")) {
        monthlyCost = (rawPrice * (52 / 12)) / frequency;
      } else if (cycleName.includes("day")) {
        monthlyCost = (rawPrice * 30.44) / frequency;
      } else {
        monthlyCost = rawPrice / frequency;
      }

      totalMonthly += monthlyCost;
    });

    return {
      totalMonthly,
      totalBonusCredits, // Exposed for separate remaining balance additions
      totalYearly: totalMonthly * 12,
      totalWeekly: totalMonthly / (52 / 12),
      totalDaily: totalMonthly / 30.44,
    };
  }, [subscriptions]);
}
