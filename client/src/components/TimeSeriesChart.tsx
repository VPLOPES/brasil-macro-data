import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { useMemo } from "react";

interface DataPoint {
  date: Date | string;
  value: number;
  periodCode?: string;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  name: string;
  unit?: string;
  color?: string;
  showArea?: boolean;
  showGrid?: boolean;
  showZeroLine?: boolean;
  height?: number;
  dateFormat?: "short" | "long" | "month";
}

export function TimeSeriesChart({
  data,
  name,
  unit = "%",
  color = "var(--chart-1)",
  showArea = false,
  showGrid = true,
  showZeroLine = false,
  height = 300,
  dateFormat = "short",
}: TimeSeriesChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      const date = typeof item.date === "string" ? new Date(item.date) : item.date;
      return {
        ...item,
        date: date.getTime(),
        dateStr: formatDate(date, dateFormat),
      };
    });
  }, [data, dateFormat]);

  function formatDate(date: Date, format: "short" | "long" | "month"): string {
    switch (format) {
      case "long":
        return date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        });
      case "month":
        return date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        });
      case "short":
      default:
        return date.toLocaleDateString("pt-BR", {
          month: "2-digit",
          year: "2-digit",
        });
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {date.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-lg font-semibold">
            {payload[0].value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm text-muted-foreground">{unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(new Date(value), dateFormat)}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showZeroLine && (
            <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
          )}
          <defs>
            <linearGradient id={`gradient-${name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${name})`}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(new Date(value), dateFormat)}
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}${unit}`}
        />
        <Tooltip content={<CustomTooltip />} />
        {showZeroLine && (
          <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Multi-line chart for comparing indicators
interface MultiSeriesData {
  date: Date | string;
  [key: string]: number | Date | string;
}

interface MultiSeriesChartProps {
  data: MultiSeriesData[];
  series: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  unit?: string;
  height?: number;
  showGrid?: boolean;
}

export function MultiSeriesChart({
  data,
  series,
  unit = "%",
  height = 300,
  showGrid = true,
}: MultiSeriesChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      const date = typeof item.date === "string" ? new Date(item.date) : item.date;
      return {
        ...item,
        date: date.getTime(),
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">
            {date.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">{entry.name}:</span>
              <span className="text-sm font-semibold">
                {entry.value?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("pt-BR", {
              month: "2-digit",
              year: "2-digit",
            })
          }
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}${unit}`}
        />
        <Tooltip content={<CustomTooltip />} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: s.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
