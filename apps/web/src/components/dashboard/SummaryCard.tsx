import React from "react";
import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const CREDIT_KEYWORDS = ["bonus", "dividend", "commission", "income"];

export function SummaryCard({
  title,
  value,
  icon,
  loading,
  trend,
  trendUp,
  gradient,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: string;
  trendUp?: boolean;
  gradient: string;
}) {
  const titleLower = title ? title.toLowerCase() : "";
  const isCredit = CREDIT_KEYWORDS.some((kw) => titleLower.includes(kw));

  // Dynamic gradient selection: defaults to income green when keywords match, otherwise preserves parent gradient
  const cardGradient = isCredit
    ? "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20"
    : gradient;

  return (
    <Card
      className={`overflow-hidden relative rounded-3xl border bg-gradient-to-br ${cardGradient} shadow-sm hover:shadow-md transition-all`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 backdrop-blur-sm rounded-2xl shadow-sm ${
              isCredit
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-background/50"
            }`}
          >
            {icon}
          </div>
          {trend && (
            <span
              className={`text-xs font-bold px-2.5 py-1 flex items-center gap-1 rounded-full ${
                trendUp !== false
                  ? "bg-green-500/20 text-green-600"
                  : "bg-red-500/20 text-red-600"
              }`}
            >
              <TrendingUp
                className={`w-3 h-3 ${trendUp === false && "rotate-180"}`}
              />
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-background/60" />
          ) : (
            <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
