import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndicatorCardProps {
  name: string;
  description?: string;
  value: number | null;
  previousValue?: number | null;
  change?: number | null;
  accumulated12m?: number | null;
  accumulatedYTD?: number | null;
  unit: string;
  lastUpdate?: Date | null;
  isLoading?: boolean;
  onClick?: () => void;
}

export function IndicatorCard({
  name,
  description,
  value,
  previousValue,
  change,
  accumulated12m,
  accumulatedYTD,
  unit,
  lastUpdate,
  isLoading,
  onClick,
}: IndicatorCardProps) {
  const formatValue = (val: number | null | undefined, decimals: number = 2) => {
    if (val === null || val === undefined) return "—";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  };

  const getChangeColor = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) return "text-muted-foreground";
    return val > 0 ? "value-positive" : "value-negative";
  };

  const getChangeIcon = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) {
      return <Minus className="h-3 w-3" />;
    }
    return val > 0 ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  if (isLoading) {
    return (
      <div className="indicator-card animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-3" />
        <div className="h-8 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "indicator-card cursor-pointer",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            {formatDate(lastUpdate)}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold tabular-nums">
          {formatValue(value)}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {change !== null && change !== undefined && (
          <div className={cn("flex items-center gap-1", getChangeColor(change))}>
            {getChangeIcon(change)}
            <span className="tabular-nums">{formatValue(change)} p.p.</span>
          </div>
        )}

        {accumulated12m !== null && accumulated12m !== undefined && (
          <div className="text-muted-foreground">
            <span className="text-xs">12M:</span>{" "}
            <span className={cn("tabular-nums", getChangeColor(accumulated12m))}>
              {formatValue(accumulated12m)}%
            </span>
          </div>
        )}

        {accumulatedYTD !== null && accumulatedYTD !== undefined && (
          <div className="text-muted-foreground">
            <span className="text-xs">Ano:</span>{" "}
            <span className={cn("tabular-nums", getChangeColor(accumulatedYTD))}>
              {formatValue(accumulatedYTD)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for sidebar or smaller displays
export function IndicatorCardCompact({
  name,
  value,
  change,
  unit,
}: Pick<IndicatorCardProps, "name" | "value" | "change" | "unit">) {
  const formatValue = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getChangeColor = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) return "text-muted-foreground";
    return val > 0 ? "value-positive" : "value-negative";
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">
          {formatValue(value)} {unit}
        </span>
        {change !== null && change !== undefined && (
          <span className={cn("text-xs tabular-nums", getChangeColor(change))}>
            {change > 0 ? "+" : ""}
            {formatValue(change)}
          </span>
        )}
      </div>
    </div>
  );
}
