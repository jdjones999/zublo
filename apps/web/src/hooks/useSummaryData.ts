import { useMemo } from "react";
import type { Subscription } from "@/types";

const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function useSummaryData(subscriptions: Subscription[] = []) {
  return useMemo(() => {
    let totalMonthly = 0;
    let totalBonusCredits = 0;

    subscriptions.forEach((sub) => {
      if (sub.inactive) return;

      const titleLower = sub.name ? sub.name.toLowerCase().trim() : "";
      const isCredit = CREDIT_KEYWORDS.some((kw) => titleLower.includes(kw));

      // Resolve cycle across relations and fallback properties
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

      if (cycleName.includes("year")) {
        monthlyCost = rawPrice / (12 * frequency);
      } else if (cycleName.includes("week")) {
        monthlyCost = (rawPrice * (52 / 12)) / frequency;
      } else if (cycleName.includes("day")) {
        monthlyCost = (rawPrice * 30.44) / frequency;
      } else if (cycleName.includes("one") || cycleName.includes("once")) {
        monthlyCost = rawPrice / frequency;
      } else {
        monthlyCost = rawPrice / frequency;
      }

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
      totalWeekly: totalMonthly / (52 / 12),
      totalDaily: totalMonthly / 30.44,
    };
  }, [subscriptions]);
}
