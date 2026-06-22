import { InstanceStatus } from "@/hooks/useMonitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wifi, WifiOff, RefreshCw, EyeOff, HelpCircle } from "lucide-react";

interface InstancesTableProps {
  instances: InstanceStatus[];
  isLoading: boolean;
}

/**
 * O badge de Status usa o campo `result` do monitor:
 *   ok | reconnected | failed | ignored
 */
function getStatusConfig(result: string) {
  switch (result) {
    case "ok":
      return {
        label: "Online",
        dotClass: "status-dot-online",
        badgeClass:
          "bg-[oklch(0.75_0.18_155_/_0.1)] text-[oklch(0.75_0.18_155)] border-[oklch(0.75_0.18_155_/_0.3)]",
        icon: Wifi,
      };
    case "reconnected":
      return {
        label: "Reconectada",
        dotClass: "status-dot-connecting",
        badgeClass:
          "bg-[oklch(0.7_0.15_80_/_0.1)] text-[oklch(0.7_0.15_80)] border-[oklch(0.7_0.15_80_/_0.3)]",
        icon: RefreshCw,
      };
    case "failed":
      return {
        label: "Offline",
        dotClass: "status-dot-offline",
        badgeClass:
          "bg-[oklch(0.65_0.22_25_/_0.1)] text-[oklch(0.65_0.22_25)] border-[oklch(0.65_0.22_25_/_0.3)]",
        icon: WifiOff,
      };
    case "ignored":
      return {
        label: "Ignorada",
        dotClass: "",
        badgeClass: "bg-muted/30 text-muted-foreground border-muted/50",
        icon: EyeOff,
      };
    default:
      return {
        label: "Desconhecido",
        dotClass: "",
        badgeClass: "bg-muted/30 text-muted-foreground border-muted/50",
        icon: HelpCircle,
      };
  }
}

/** Traduz o estado bruto de conexão da Evolution para um rótulo legível. */
function formatState(state: string) {
  switch (state) {
    case "open":
      return "Conectado";
    case "close":
    case "closed":
      return "Desconectado";
    case "connecting":
      return "Conectando";
    default:
      return state ? state : "—";
  }
}

export function InstancesTable({ instances, isLoading }: InstancesTableProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (instances.length === 0) {
    return (
      <Card className="bg-card/50 border-border/30">
        <CardContent className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
            <Wifi className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            Nenhuma instância encontrada
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Aguardando primeiro ciclo de monitoramento...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Instâncias
          <span className="text-xs font-mono text-muted-foreground ml-auto">
            {instances.length} registrada{instances.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs font-mono uppercase tracking-wider text-muted-foreground h-9 pl-6">
                Status
              </TableHead>
              <TableHead className="text-xs font-mono uppercase tracking-wider text-muted-foreground h-9">
                Instância
              </TableHead>
              <TableHead className="text-xs font-mono uppercase tracking-wider text-muted-foreground h-9">
                Situação
              </TableHead>
              <TableHead className="text-xs font-mono uppercase tracking-wider text-muted-foreground h-9 hidden sm:table-cell">
                Conexão
              </TableHead>
              <TableHead className="text-xs font-mono uppercase tracking-wider text-muted-foreground h-9 hidden md:table-cell pr-6">
                Tentativas
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.map((instance) => {
              const config = getStatusConfig(instance.result);
              const Icon = config.icon;

              return (
                <TableRow
                  key={instance.name}
                  className="border-border/20 hover:bg-accent/30 transition-colors duration-100"
                >
                  <TableCell className="pl-6 py-3">
                    <div className="flex items-center gap-2.5">
                      {config.dotClass ? (
                        <div className={config.dotClass} />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {instance.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`${config.badgeClass} font-mono text-xs gap-1`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 hidden sm:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatState(instance.state)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 hidden md:table-cell pr-6">
                    <span className="font-mono text-xs text-muted-foreground">
                      {instance.attempts > 0 ? `${instance.attempts}x` : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
