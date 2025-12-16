import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { month: "Jan", directSales: 4200, screenings: 1800, nftSales: 2400 },
  { month: "Feb", directSales: 5100, screenings: 2200, nftSales: 2800 },
  { month: "Mar", directSales: 4800, screenings: 2600, nftSales: 3200 },
  { month: "Apr", directSales: 6200, screenings: 2900, nftSales: 3600 },
  { month: "May", directSales: 7100, screenings: 3400, nftSales: 4100 },
  { month: "Jun", directSales: 6800, screenings: 3800, nftSales: 4500 },
  { month: "Jul", directSales: 7900, screenings: 4200, nftSales: 4900 },
  { month: "Aug", directSales: 8500, screenings: 4600, nftSales: 5200 },
  { month: "Sep", directSales: 9200, screenings: 5100, nftSales: 5800 },
  { month: "Oct", directSales: 8800, screenings: 5400, nftSales: 6200 },
  { month: "Nov", directSales: 10200, screenings: 5800, nftSales: 6800 },
  { month: "Dec", directSales: 11500, screenings: 6200, nftSales: 7400 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-border/50">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenue Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(270, 70%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorScreenings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNFT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(190, 70%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(190, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="directSales"
                name="Direct Sales"
                stroke="hsl(270, 70%, 60%)"
                fillOpacity={1}
                fill="url(#colorDirect)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="screenings"
                name="Screenings"
                stroke="hsl(38, 92%, 50%)"
                fillOpacity={1}
                fill="url(#colorScreenings)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="nftSales"
                name="NFT Sales"
                stroke="hsl(190, 70%, 50%)"
                fillOpacity={1}
                fill="url(#colorNFT)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
