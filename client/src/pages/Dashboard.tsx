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

export default function Dashboard() {
  const { status, instances, stats, isLoading, error, lastUpdate, refetch } =
    useMonitor(15000);

  return (
    <div className="min-h-screen grid-bg">
      <Header stats={stats} lastUpdate={lastUpdate} onRefresh={refetch} />

      <main className="container py-6 space-y-6">
        {error && <ConnectionBanner error={error} onRetry={refetch} />}

        <StatusCards status={status} isLoading={isLoading} />

        <InstancesTable instances={instances} isLoading={isLoading} />
      </main>
    </div>
  );
}
