import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Film } from "lucide-react";

interface Distributor {
  name: string;
  avatar: string;
  filmsSold: number;
  revenue: string;
  trend: number;
}

interface DistributorPerformanceProps {
  distributors: Distributor[];
}

export function DistributorPerformance({ distributors }: DistributorPerformanceProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Distributor Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {distributors.map((distributor, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={distributor.avatar}
                  alt={distributor.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-primary/30"
                />
                <div>
                  <p className="font-medium">{distributor.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Film className="h-3 w-3" />
                    {distributor.filmsSold} films sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{distributor.revenue}</p>
                <Badge
                  variant={distributor.trend >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {distributor.trend >= 0 ? "+" : ""}
                  {distributor.trend}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
