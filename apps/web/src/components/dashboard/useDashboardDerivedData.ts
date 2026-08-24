import { useMemo } from "react";

import type { User } from "@/types";

interface SummaryData {
  totalMonthly: number;
  totalBonus?: number;
}

interface YearlyCostPoint {
  year: number;
  month: number;
  total: number;
}

interface UseDashboardDerivedDataParams {
  user: User | null | undefined;
  summary?: SummaryData;
  yearlyCosts?: YearlyCostPoint[];
}

export function useDashboardDerivedData({
  user,
  summary,
  yearlyCosts,
}: UseDashboardDerivedDataParams) {
  const chartData = useMemo(
    () =>
      yearlyCosts?.slice(-12).map((point) => ({
        name: `${point.year}/${String(point.month).padStart(2, "0")}`,
        cost: Number(point.total.toFixed(2)),
      })) ?? [],
    [yearlyCosts],
  );

  // Add bonus credits to base monthly budget to expand effective spending power
  const baseBudget = user?.budget ?? 0;
  const totalBonus = summary?.totalBonus ?? 0;
  const budget = baseBudget + totalBonus;

  const totalExpenses = summary?.totalMonthly ?? 0;
  const budgetUsed =
    budget > 0
      ? Math.min(100, (totalExpenses / budget) * 100)
      : 0;
  const isOverBudget = budgetUsed >= 100;
  const remaining = budget - totalExpenses;

  return {
    budget,
    budgetUsed,
    chartData,
    isOverBudget,
    remaining,
  };
}
