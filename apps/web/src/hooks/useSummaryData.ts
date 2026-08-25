import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { toMonthly } from "@/lib/utils";
import { currenciesService } from "@/services/currencies";
import { subscriptionsService } from "@/services/subscriptions";
import type { Subscription } from "@/types";

// Keep this as a fallback for older data or imports
const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function useSummaryData(userId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(userId),
    queryFn: async () => {
      const [subs, currencies] = await Promise.all([
        subscriptionsService.listActive(userId),
        currenciesService.list(userId),
      ]);

      const mainCurrency = currencies.find((c) => c.is_main);
      const mainRate = mainCurrency?.rate ?? 1;
      const mainSymbol = mainCurrency?.symbol ?? "$";

      let totalMonthlyExpenses = 0;
      let totalMonthlyIncome = 0;
      let mostExpensive: {
        id: string;
        name: string;
        monthly: number;
        logo?: string;
        record: Subscription;
      } | null = null;

      for (const sub of subs) {
        const currency = sub.expand?.currency;
        const cycleName = sub.expand?.cycle?.name ?? sub.billing_cycle ?? "Monthly";
        const categoryName = sub.expand?.category?.name ?? "";
        const frequency = sub.frequency || 1;

        const titleLower = sub.name ? sub.name.toLowerCase().trim() : "";
        const categoryLower = categoryName.toLowerCase().trim();

        // ✅ NEW: Use the backend `is_income` flag first, fall back to keyword matching
        const isCreditKeyword = CREDIT_KEYWORDS.some(
          (kw) => titleLower.includes(kw) || categoryLower.includes(kw)
        );
        const isCreditItem = sub.is_income === true || isCreditKeyword;

        const rate = currency?.rate ?? 1;
        const rawMainPrice = (sub.price / rate) * mainRate;

        if (isCreditItem) {
          // ✅ Add income to the budget (not subtract from expenses)
          const monthlyCredit = toMonthly(sub.price, cycleName, frequency);
          const monthlyMainCredit = (monthlyCredit / rate) * mainRate;
          totalMonthlyIncome += monthlyMainCredit;
        } else {
          // Calculate standard recurring debt expense
          const monthly = toMonthly(sub.price, cycleName, frequency);
          const monthlyMain = (monthly / rate) * mainRate;

          totalMonthlyExpenses += monthlyMain;

          if (!mostExpensive || monthlyMain > mostExpensive.monthly) {
            mostExpensive = {
              id: sub.id,
              name: sub.name,
              monthly: monthlyMain,
              logo: sub.logo,
              record: sub,
            };
          }
        }
      }

      // ✅ FIXED: Total Monthly is PURE EXPENSES. 
      // This keeps the 4 top cards (Monthly/Yearly/Weekly/Daily) showing only expenses.
      const totalMonthly = totalMonthlyExpenses;

      return {
        totalMonthly, // Pure expenses - does NOT change when income is added
        totalBonus: totalMonthlyIncome, // This is what ADDS to the remaining budget and turns it green
        totalYearly: totalMonthly * 12,
        totalWeekly: (totalMonthly * 12) / 52,
        totalDaily: (totalMonthly * 12) / 365,
        mainSymbol,
        count: subs.length,
        mostExpensive,
      };
    },
    enabled: !!userId,
  });
}
