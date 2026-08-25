import { Plus, Upload, TrendingUp, LineChart, Coins, MoreHorizontal } from "lucide-react";
import type { ChangeEvent, MutableRefObject } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubscriptionsPageHeaderProps {
  importInputRef: MutableRefObject<HTMLInputElement | null>;
  isImporting: boolean;
  onImportChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: (format: "json" | "xlsx") => void;
  // UPDATED: Now accepts an optional category name to pre-fill the form
  onCreate: (categoryName?: string) => void;
}

export function SubscriptionsPageHeader({
  importInputRef,
  isImporting,
  onImportChange,
  onExport,
  onCreate,
}: SubscriptionsPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          {t("subscriptions")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("subscriptions_desc")}</p>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={onImportChange}
        />

        <Button
          variant="outline"
          className="rounded-xl border bg-background/50 shadow-sm backdrop-blur"
          disabled={isImporting}
          onClick={() => importInputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-4 w-4" />
          {isImporting ? t("importing") : t("import")}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl border bg-background/50 shadow-sm backdrop-blur"
            >
              {t("export")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 rounded-xl" align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onExport("json")}
            >
              {t("export_json")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onExport("xlsx")}
            >
              {t("export_xlsx")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* UPDATED: Replaced single button with a Dropdown for specific income types */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-primary/90 to-primary font-semibold shadow-md transition-all hover:from-primary hover:to-primary/90 sm:w-auto"
            >
              <Plus className="mr-1.5 h-5 w-5" />
              {t("add_subscription")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 rounded-xl" align="end">
            <DropdownMenuLabel>{t("quick_add")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onCreate("Bonus")}
            >
              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
              {t("bonus")}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onCreate("Dividend")}
            >
              <Coins className="mr-2 h-4 w-4 text-blue-500" />
              {t("dividend")}
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onCreate("Commission")}
            >
              <LineChart className="mr-2 h-4 w-4 text-purple-500" />
              {t("commission")}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onCreate("")}
            >
              <MoreHorizontal className="mr-2 h-4 w-4" />
              {t("other")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
