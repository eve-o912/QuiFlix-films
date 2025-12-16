import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Film } from "lucide-react";

const data = [
  { name: "Neon Dreams", revenue: 24780, fill: "hsl(270, 70%, 60%)" },
  { name: "The Last Horizon", revenue: 18450, fill: "hsl(38, 92%, 50%)" },
  { name: "Whispers in Time", revenue: 12340, fill: "hsl(190, 70%, 50%)" },
  { name: "The Deep Blue", revenue: 12340, fill: "hsl(280, 70%, 55%)" },
  { name: "Midnight Protocol", revenue: 8900, fill: "hsl(320, 70%, 55%)" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-lg border border-border/50">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-sm gradient-gold-text font-semibold">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function TopFilmsChart() {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Film className="h-5 w-5 text-primary" />
          Top Performing Films
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" horizontal={false} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(222, 30%, 14%)" }} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
