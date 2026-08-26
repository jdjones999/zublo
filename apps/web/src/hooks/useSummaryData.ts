import { useQuery } from "@tanstack/react-query";
import { isCreditItem, queryKeys } from "@/lib/queryKeys";
import { toMonthly } from "@/lib/utils";
import { currenciesService } from "@/services/currencies";
import { subscriptionsService } from "@/services/subscriptions";
import type { Subscription } from "@/types";

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
      let mostExpensive: { id: string; name: string; monthly: number; logo?: string; record: Subscription } | null = null;

      for (const sub of subs) {
        const currency = sub.expand?.currency;
        const cycleName = sub.expand?.cycle?.name ?? "Monthly";
        const frequency = sub.frequency || 1;

        const isCredit = isCreditItem(sub);

        const rate = currency?.rate ?? 1;

        if (isCredit) {
          const monthlyCredit = toMonthly(sub.price, cycleName, frequency);
          totalMonthlyIncome += (monthlyCredit / rate) * mainRate;
          console.log("✅ ADDING TO INCOME (CREDIT)");
        } else {
          const monthly = toMonthly(sub.price, cycleName, frequency);
          const monthlyMain = (monthly / rate) * mainRate;
          totalMonthlyExpenses += monthlyMain;
          console.log("❌ ADDING TO EXPENSES (DEBIT)");
        }
      }

      console.log("🔍 FINAL totalMonthly:", totalMonthlyExpenses);
      console.log("🔍 FINAL totalBonus:", totalMonthlyIncome);

      return {
        totalMonthly: totalMonthlyExpenses,
        totalBonus: totalMonthlyIncome,
        totalYearly: totalMonthlyExpenses * 12,
        totalWeekly: (totalMonthlyExpenses * 12) / 52,
        totalDaily: (totalMonthlyExpenses * 12) / 365,
        mainSymbol,
        count: subs.length,
        mostExpensive,
      };
    },
    enabled: !!userId,
  });
}
