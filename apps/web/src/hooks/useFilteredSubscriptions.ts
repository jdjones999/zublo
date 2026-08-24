import { useMemo } from "react";

import type {
  SubscriptionFiltersState,
  SubscriptionSortKey,
} from "@/components/subscriptions/subscriptionsPage.types";
import type { Subscription } from "@/types";

const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

interface UseFilteredSubscriptionsParams {
  subscriptions: Subscription[];
  searchTerm: string;
  filters: SubscriptionFiltersState;
  sort: SubscriptionSortKey;
  sortDir: "asc" | "desc";
  disabledToBottom?: boolean;
}

export function useFilteredSubscriptions({
  subscriptions,
  searchTerm,
  filters,
  sort,
  sortDir,
  disabledToBottom,
}: UseFilteredSubscriptionsParams) {
  return useMemo(() => {
    // 1. Exclude credit/income items from standard subscription calculations
    let result = subscriptions.filter((subscription) => {
      const titleLower = subscription.name ? subscription.name.toLowerCase() : "";
      const isCredit = CREDIT_KEYWORDS.some((keyword) =>
        titleLower.includes(keyword)
      );
      return !isCredit;
    });

    // 2. Filter by search term
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter((subscription) =>
        subscription.name.toLowerCase().includes(query),
      );
    }

    // 3. Filter by state (active / inactive)
    if (filters.state === "active") {
      result = result.filter((subscription) => !subscription.inactive);
    } else if (filters.state === "inactive") {
      result = result.filter((subscription) => subscription.inactive);
    }

    // 4. Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter((subscription) =>
        filters.categories.includes(subscription.category ?? ""),
      );
    }

    // 5. Filter by household members
    if (filters.members.length > 0) {
      result = result.filter((subscription) =>
        filters.members.includes(subscription.payer ?? ""),
      );
    }

    // 6. Filter by payment methods
    if (filters.payments.length > 0) {
      result = result.filter((subscription) =>
        filters.payments.includes(subscription.payment_method ?? ""),
      );
    }

    // 7. Sort results
    result.sort((left, right) => {
      let comparison = 0;

      if (sort === "name") {
        comparison = left.name.localeCompare(right.name);
      } else if (sort === "price") {
        comparison = left.price - right.price;
      } else if (sort === "date") {
        comparison = (left.next_payment || "").localeCompare(
          right.next_payment || "",
        );
      } else if (sort === "status") {
        comparison = Number(left.inactive) - Number(right.inactive);
      }

      return sortDir === "asc" ? comparison : -comparison;
    });

    // 8. Move disabled/inactive items to bottom if flag is enabled
    if (disabledToBottom) {
      result.sort((left, right) => Number(left.inactive) - Number(right.inactive));
    }

    return result;
  }, [subscriptions, searchTerm, filters, sort, sortDir, disabledToBottom]);
}
