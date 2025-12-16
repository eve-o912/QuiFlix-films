import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownRight, Film, Ticket, Coins } from "lucide-react";
import { Transaction } from "@/types/film";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const typeConfig = {
  direct_sale: {
    icon: Film,
    label: "Direct Sale",
    color: "text-primary",
  },
  screening_ticket: {
    icon: Ticket,
    label: "Screening",
    color: "text-accent",
  },
  nft_purchase: {
    icon: Coins,
    label: "NFT Purchase",
    color: "text-green-400",
  },
  nft_distribution: {
    icon: ArrowUpRight,
    label: "Distribution",
    color: "text-blue-400",
  },
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {transactions.map((tx) => {
            const config = typeConfig[tx.type];
            const Icon = config.icon;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted/50", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.filmTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} • {tx.buyerName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm gradient-gold-text">
                    +${tx.netAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
