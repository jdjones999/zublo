import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { toMonthly } from "@/lib/utils";
import { currenciesService } from "@/services/currencies";
import { subscriptionsService } from "@/services/subscriptions";
import type { Subscription } from "@/types";

// FORCED credit names - this is the ONLY thing that matters
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

        // FORCED: Just look at the name or category. If it matches, it's a credit.
        const titleLower = sub.name ? sub.name.toLowerCase().trim() : "";
        const categoryLower = categoryName.toLowerCase().trim();
        const isCreditItem = CREDIT_KEYWORDS.some(
          (kw) => titleLower.includes(kw) || categoryLower.includes(kw)
        );

        const rate = currency?.rate ?? 1;
        const rawMainPrice = (sub.price / rate) * mainRate;

        if (isCreditItem) {
          // ✅ Add to income - NEVER counts as an expense
          const monthlyCredit = toMonthly(sub.price, cycleName, frequency);
          const monthlyMainCredit = (monthlyCredit / rate) * mainRate;
          totalMonthlyIncome += monthlyMainCredit;
        } else {
          // ✅ Add to expenses
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

      // ✅ Pure expenses (does not include income)
      const totalMonthly = totalMonthlyExpenses;

      return {
        totalMonthly,
        totalBonus: totalMonthlyIncome, // Income used for Budget Card
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
