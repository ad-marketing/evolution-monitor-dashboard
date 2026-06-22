import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Formatos reais da API do monitor Go (v2.2.0):
 * GET /api/status    -> { total, ok, failed, reconnected, ignored, last_check, status }
 * GET /api/instances -> [ { name, status:"open"|"close"|..., result:"ok"|"failed", attempts } ]
 * GET /api/stats     -> { started_at, uptime_seconds, cycles_executed, total_reconnects,
 *                         total_failures, total_notifications, chatwoot_resyncs }
 */

// Instância como entregue pela API
export interface RawInstance {
  name: string;
  status: string; // estado de conexão da Evolution: "open", "close", "connecting"...
  result: string; // resultado do monitor: "ok", "failed", "reconnected", "ignored"
  attempts?: number;
}

// Instância normalizada para a UI
export interface InstanceStatus {
  name: string;
  state: string; // estado de conexão bruto (open/close/...)
  result: string; // ok/failed/reconnected/ignored
  attempts: number;
}

export interface MonitorStatus {
  status: string;
  last_check: string;
  total: number;
  ok: number;
  reconnected: number;
  failed: number;
  ignored: number;
}

export interface MonitorStats {
  started_at: string;
  uptime_seconds: number;
  cycles_executed: number;
  total_reconnects: number;
  total_failures: number;
  total_notifications: number;
  chatwoot_resyncs: number;
}

const API_BASE = import.meta.env.VITE_MONITOR_API_URL || "";

function normalizeInstance(raw: RawInstance): InstanceStatus {
  return {
    name: raw.name,
    state: raw.status ?? "",
    result: raw.result ?? "",
    attempts: typeof raw.attempts === "number" ? raw.attempts : 0,
  };
}

export function useMonitor(refreshInterval = 15000) {
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [instances, setInstances] = useState<InstanceStatus[]>([]);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const failCount = useRef(0);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, instancesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/status`),
        fetch(`${API_BASE}/api/instances`),
        fetch(`${API_BASE}/api/stats`),
      ]);

      if (!statusRes.ok || !instancesRes.ok || !statsRes.ok) {
        throw new Error("Falha ao conectar com o monitor");
      }

      const statusText = await statusRes.clone().text();
      if (statusText.trim().startsWith("<")) {
        throw new Error("API retornou HTML ao invés de JSON");
      }

      const [statusData, instancesData, statsData] = await Promise.all([
        statusRes.json(),
        instancesRes.json(),
        statsRes.json(),
      ]);

      setStatus(statusData as MonitorStatus);
      setInstances(
        Array.isArray(instancesData)
          ? (instancesData as RawInstance[]).map(normalizeInstance)
          : []
      );
      setStats(statsData as MonitorStats);
      setError(null);
      setLastUpdate(new Date());
      failCount.current = 0;
    } catch (err) {
      failCount.current++;
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    status,
    instances,
    stats,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
}
