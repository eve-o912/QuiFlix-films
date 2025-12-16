import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface RevenueItem {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

interface RevenueBreakdownProps {
  items: RevenueItem[];
  totalRevenue: string;
}

export function RevenueBreakdown({ items, totalRevenue }: RevenueBreakdownProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5 text-primary" />
          Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Visual Bar */}
        <div className="h-4 rounded-full overflow-hidden flex mb-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="h-full transition-all duration-500"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-muted-foreground">Total Revenue</span>
          <span className="text-xl font-bold gradient-gold-text">{totalRevenue}</span>
        </div>
      </CardContent>
    </Card>
  );
}
