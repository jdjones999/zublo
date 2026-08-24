import { useMemo } from "react";
import type { Subscription } from "@/types";

const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function useSummaryData(subscriptions: Subscription[] = []) {
  return useMemo(() => {
    let totalMonthlyExpenses = 0;
    let totalMonthlyCredits = 0;

    subscriptions.forEach((sub) => {
      if (sub.inactive) return;

      const titleLower = sub.name ? sub.name.toLowerCase().trim() : "";
      const categoryName = sub.expand?.category?.name
        ? sub.expand.category.name.toLowerCase().trim()
        : "";

      // Identify if the entry represents a credit/income stream
      const isCredit = CREDIT_KEYWORDS.some(
        (kw) => titleLower.includes(kw) || categoryName.includes(kw)
      );

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

      // Calculate base monthly normalized amount
      let monthlyAmount = rawPrice;
      if (cycleName.includes("year")) {
        monthlyAmount = rawPrice / (12 * frequency);
      } else if (cycleName.includes("week")) {
        monthlyAmount = (rawPrice * (52 / 12)) / frequency;
      } else if (cycleName.includes("day")) {
        monthlyAmount = (rawPrice * 30.44) / frequency;
      } else {
        monthlyAmount = rawPrice / frequency;
      }

      if (isCredit) {
        // Accumulate as credit/income
        totalMonthlyCredits += monthlyAmount;
      } else {
        // Accumulate as recurring debt/expense
        totalMonthlyExpenses += monthlyAmount;
      }
    });

    // Net monthly expense (Expenses minus Credits)
    const netMonthly = Math.max(0, totalMonthlyExpenses - totalMonthlyCredits);

    return {
      totalMonthly: netMonthly,
      totalCredits: totalMonthlyCredits,
      totalExpenses: totalMonthlyExpenses,
      totalYearly: netMonthly * 12,
      totalWeekly: netMonthly / (52 / 12),
      totalDaily: netMonthly / 30.44,
    };
  }, [subscriptions]);
}
