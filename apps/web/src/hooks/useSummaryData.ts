import { useMemo } from "react";
import type { Subscription } from "@/types";

const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function useSummaryData(subscriptions: Subscription[] = []) {
  return useMemo(() => {
    let totalMonthly = 0;
    let totalBonusCredits = 0;

    subscriptions.forEach((sub) => {
      if (!sub.active) return;

      const titleLower = sub.name ? sub.name.toLowerCase() : "";
      const isCredit = CREDIT_KEYWORDS.some((keyword) =>
        titleLower.includes(keyword)
      );

      // Convert price based on billing cycle
      let monthlyCost = sub.price || 0;
      if (sub.billing_cycle === "yearly") {
        monthlyCost /= 12;
      } else if (sub.billing_cycle === "weekly") {
        monthlyCost *= 4.33;
      } else if (sub.billing_cycle === "daily") {
        monthlyCost *= 30;
      }

      if (isCredit) {
        totalBonusCredits += monthlyCost;
      } else {
        // Only non-credit items contribute to debt totals
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
