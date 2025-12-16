import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "gold" | "primary";
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      variant="glass"
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
        variant === "gold" && "border-accent/30 hover:border-accent/50",
        variant === "primary" && "border-primary/30 hover:border-primary/50"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-10",
          variant === "gold" && "bg-gradient-to-br from-accent to-transparent",
          variant === "primary" && "bg-gradient-to-br from-primary to-transparent"
        )}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-3xl font-bold font-display",
                variant === "gold" && "gradient-gold-text",
                variant === "primary" && "gradient-text"
              )}
            >
              {value}
            </p>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-green-400",
                  changeType === "negative" && "text-red-400",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div
            className={cn(
              "rounded-lg p-3",
              variant === "gold" && "bg-accent/20",
              variant === "primary" && "bg-primary/20",
              variant === "default" && "bg-muted"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                variant === "gold" && "text-accent",
                variant === "primary" && "text-primary",
                variant === "default" && "text-muted-foreground"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
