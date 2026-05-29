/**
 * Dashboard - Evolution Monitor
 * Design: Command Center — estética operacional escura
 * - Fundo slate-950 com grid sutil
 * - Indicadores neon pulsantes
 * - Tipografia monospace para dados
 * - Alta densidade informacional
 */

import { useMonitor } from "@/hooks/useMonitor";
import { StatusCards } from "@/components/dashboard/StatusCards";
import { InstancesTable } from "@/components/dashboard/InstancesTable";
import { Header } from "@/components/dashboard/Header";
import { ConnectionBanner } from "@/components/dashboard/ConnectionBanner";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

export default function Dashboard() {
  const { status, instances, stats, isLoading, error, isDemo, lastUpdate, refetch } =
    useMonitor(15000);

  return (
    <div className="min-h-screen grid-bg">
      <Header stats={stats} lastUpdate={lastUpdate} onRefresh={refetch} />

      <main className="container py-6 space-y-6">
        {/* Demo mode banner */}
        {isDemo && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">Modo demonstração</span>
              {" — "}Configure a variável <code className="font-mono bg-muted/30 px-1 py-0.5 rounded text-xs">VITE_MONITOR_API_URL</code> para conectar ao monitor real.
            </p>
            <Badge variant="outline" className="ml-auto text-xs font-mono border-primary/30 text-primary">
              DEMO
            </Badge>
          </div>
        )}

        {error && <ConnectionBanner error={error} />}

        <StatusCards status={status} isLoading={isLoading} />

        <InstancesTable instances={instances} isLoading={isLoading} />
      </main>
    </div>
  );
}
