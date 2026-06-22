import { MonitorStats } from "@/hooks/useMonitor";
import { Activity, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeaderProps {
  stats: MonitorStats | null;
  lastUpdate: Date | null;
  onRefresh: () => void;
}

export function Header({ stats, lastUpdate, onRefresh }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              Evolution Monitor
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {stats?.uptime ? `Uptime: ${stats.uptime}` : "Conectando..."}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cycle counter */}
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-foreground/70">
                Ciclo #{stats.cycle_count}
              </span>
            </div>
          )}

          {/* Last update */}
          {lastUpdate && (
            <div className="hidden md:block text-xs text-muted-foreground font-mono">
              Atualizado:{" "}
              <span className="text-foreground/70">
                {lastUpdate.toLocaleTimeString("pt-BR")}
              </span>
            </div>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 gap-1.5 text-xs font-mono border-border/50 hover:border-primary/50 hover:text-primary transition-colors duration-150"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          {/* Settings button */}
          <Link href="/settings">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-mono border-border/50 hover:border-primary/50 hover:text-primary transition-colors duration-150"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Config</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
