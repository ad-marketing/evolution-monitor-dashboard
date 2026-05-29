import { MonitorStatus } from "@/hooks/useMonitor";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, RefreshCw, EyeOff, Server } from "lucide-react";

interface StatusCardsProps {
  status: MonitorStatus | null;
  isLoading: boolean;
}

export function StatusCards({ status, isLoading }: StatusCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card/50 border-border/30">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total",
      value: status?.total ?? 0,
      icon: Server,
      color: "text-foreground",
      bgColor: "bg-foreground/5",
      borderColor: "border-foreground/10",
    },
    {
      label: "Online",
      value: status?.ok ?? 0,
      icon: CheckCircle,
      color: "text-[oklch(0.75_0.18_155)]",
      bgColor: "bg-[oklch(0.75_0.18_155_/_0.08)]",
      borderColor: "border-[oklch(0.75_0.18_155_/_0.2)]",
    },
    {
      label: "Reconectadas",
      value: status?.reconnected ?? 0,
      icon: RefreshCw,
      color: "text-[oklch(0.7_0.15_80)]",
      bgColor: "bg-[oklch(0.7_0.15_80_/_0.08)]",
      borderColor: "border-[oklch(0.7_0.15_80_/_0.2)]",
    },
    {
      label: "Offline",
      value: status?.failed ?? 0,
      icon: XCircle,
      color: "text-[oklch(0.65_0.22_25)]",
      bgColor: "bg-[oklch(0.65_0.22_25_/_0.08)]",
      borderColor: "border-[oklch(0.65_0.22_25_/_0.2)]",
    },
    {
      label: "Ignoradas",
      value: status?.ignored ?? 0,
      icon: EyeOff,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      borderColor: "border-muted/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`${card.bgColor} ${card.borderColor} border transition-all duration-150 hover:scale-[1.02]`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
              <card.icon className={`w-4 h-4 ${card.color} opacity-70`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${card.color}`}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
