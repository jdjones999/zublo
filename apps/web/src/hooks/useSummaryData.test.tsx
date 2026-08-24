import { useQuery } from "@tanstack/react-query";
import { subscriptionsService } from "@/services/subscriptions";
import { currenciesService } from "@/services/currencies";
import type { Subscription, Currency } from "@/types";

export interface SummaryData {
  totalMonthly: number;
  totalYearly: number;
  totalWeekly: number;
  totalDaily: number;
  totalBonusCredits: number;
  mainSymbol: string;
  count: number;
  mostExpensive: {
    id: string;
    name: string;
    monthly: number;
    logo?: string;
    record: Subscription;
  } | null;
}

const CREDIT_KEYWORDS = ["bonus", "commission", "dividend", "income"];

function isCreditItem(sub: Subscription): boolean {
  const name = sub.name?.toLowerCase() || "";
  const categoryName = sub.expand?.category?.name?.toLowerCase() || "";

  return CREDIT_KEYWORDS.some(
    (keyword) => name.includes(keyword) || categoryName.includes(keyword)
  );
}

export function useSummaryData(userId: string) {
  const isEnabled = Boolean(userId);

  return useQuery({
    queryKey: ["summary-data", userId],
    enabled: isEnabled,
    queryFn: async (): Promise<SummaryData> => {
      const [subscriptions, currencies] = await Promise.all([
        subscriptionsService.listActive(userId),
        currenciesService.list(userId),
      ]);

      const mainCurrency = currencies.find((c) => c.is_main) || currencies[0];
      const mainSymbol = mainCurrency?.symbol || "$";
      const mainRate = mainCurrency?.rate || 1;

      let totalMonthly = 0;
      let totalBonusCredits = 0;
      let count = 0;
      let maxMonthly = -1;
      let mostExpensiveRecord: Subscription | null = null;

      for (const sub of subscriptions) {
        // Calculate price converted to main currency base
        const subCurrencyRate = sub.expand?.currency?.rate || 1;
        const convertedPrice = (sub.price / subCurrencyRate) * mainRate;

        // Check if item name or expanded category matches credit keywords
        if (isCreditItem(sub)) {
          // Route credit amount to bonus credits total instead of recurring debt
          totalBonusCredits += convertedPrice;
          continue;
        }

        // Standard subscription / recurring debt calculations
        count++;

        // Determine multiplier based on billing cycle frequency
        const cycleName = sub.expand?.cycle?.name?.toLowerCase() || "";
        let monthlyAmount = convertedPrice;

        if (cycleName.includes("year") || cycleName.includes("annual")) {
          monthlyAmount = convertedPrice / 12;
        } else if (cycleName.includes("week")) {
          monthlyAmount = (convertedPrice * 52) / 12;
        } else if (cycleName.includes("day")) {
          monthlyAmount = (convertedPrice * 365) / 12;
        }

        totalMonthly += monthlyAmount;

        if (monthlyAmount > maxMonthly) {
          maxMonthly = monthlyAmount;
          mostExpensiveRecord = sub;
        }
      }

      return {
        totalMonthly,
        totalYearly: totalMonthly * 12,
        totalWeekly: (totalMonthly * 12) / 52,
        totalDaily: (totalMonthly * 12) / 365,
        totalBonusCredits,
        mainSymbol,
        count,
        mostExpensive: mostExpensiveRecord
          ? {
              id: mostExpensiveRecord.id,
              name: mostExpensiveRecord.name,
              monthly: maxMonthly,
              logo: mostExpensiveRecord.logo,
              record: mostExpensiveRecord,
            }
          : null,
      };
    },
  });
}
