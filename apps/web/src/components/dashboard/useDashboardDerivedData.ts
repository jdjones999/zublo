import { useMemo } from "react";
import type { User } from "@/types";

interface SummaryData {
  totalMonthly: number;
  totalBonusCredits?: number; // Represents total combined credits (bonus, dividend, commission, income)
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

  // Add all combined credit income (bonus, dividend, commission, income) to base budget
  const baseBudget = user?.budget ?? 0;
  const totalBonusCredits = summary?.totalBonusCredits ?? 0;
  const budget = baseBudget + totalBonusCredits;

  const totalExpenses = summary?.totalMonthly ?? 0;
  const budgetUsed =
    budget > 0
      ? Math.min(100, (totalExpenses / budget) * 100)
      : 0;
  const isOverBudget = budget > 0 ? totalExpenses > budget : false;
  const remaining = budget - totalExpenses;

  return {
    budget,
    budgetUsed,
    chartData,
    isOverBudget,
    remaining,
  };
}
