import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Play } from "lucide-react";
import { Screening } from "@/types/film";
import { cn } from "@/lib/utils";

interface UpcomingScreeningsProps {
  screenings: Screening[];
}

const statusColors = {
  upcoming: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  live: "bg-green-500/20 text-green-300 border-green-500/30 animate-pulse",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

export function UpcomingScreenings({ screenings }: UpcomingScreeningsProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Screenings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {screenings.map((screening) => (
            <div
              key={screening.id}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{screening.filmTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Hosted by {screening.hostName}
                  </p>
                </div>
                <Badge className={cn("text-xs", statusColors[screening.status])}>
                  {screening.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {screening.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {screening.time}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {screening.ticketsSold}/{screening.capacity}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  <span className="text-muted-foreground">Ticket: </span>
                  <span className="font-medium">${screening.ticketPrice}</span>
                </span>
                {screening.status === "upcoming" && (
                  <Button size="sm" variant="glow">
                    <Play className="h-4 w-4" />
                    Go Live
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
