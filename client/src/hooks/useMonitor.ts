import { useState, useEffect, useCallback, useRef } from "react";

export interface InstanceStatus {
  name: string;
  state: string;
  status: string;
  last_check: string;
  attempts?: number;
  profile_name?: string;
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
  uptime: string;
  cycle_count: number;
  last_cycle: {
    timestamp: string;
    total: number;
    ok: number;
    reconnected: number;
    failed: number;
    ignored: number;
    instances: InstanceStatus[];
  } | null;
}

const API_BASE = import.meta.env.VITE_MONITOR_API_URL || "";

// Demo data for when no API is connected
const DEMO_STATUS: MonitorStatus = {
  status: "active",
  last_check: new Date().toISOString(),
  total: 4,
  ok: 3,
  reconnected: 0,
  failed: 1,
  ignored: 0,
};

const DEMO_INSTANCES: InstanceStatus[] = [
  { name: "AdMarketingAPI", state: "open", status: "ok", last_check: new Date().toISOString() },
  { name: "PDMReservas", state: "open", status: "ok", last_check: new Date().toISOString() },
  { name: "Newstur", state: "close", status: "failed", last_check: new Date().toISOString(), attempts: 3 },
  { name: "SuporteBot", state: "open", status: "ok", last_check: new Date().toISOString() },
];

const DEMO_STATS: MonitorStats = {
  started_at: new Date(Date.now() - 86400000).toISOString(),
  uptime: "24h12m33s",
  cycle_count: 1447,
  last_cycle: {
    timestamp: new Date().toISOString(),
    total: 4,
    ok: 3,
    reconnected: 0,
    failed: 1,
    ignored: 0,
    instances: DEMO_INSTANCES,
  },
};

export function useMonitor(refreshInterval = 15000) {
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [instances, setInstances] = useState<InstanceStatus[]>([]);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isDemo, setIsDemo] = useState(false);
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
      if (statusText.startsWith("<")) {
        throw new Error("API retornou HTML ao invés de JSON");
      }

      const [statusData, instancesData, statsData] = await Promise.all([
        statusRes.json(),
        instancesRes.json(),
        statsRes.json(),
      ]);

      setStatus(statusData);
      setInstances(instancesData);
      setStats(statsData);
      setError(null);
      setIsDemo(false);
      setLastUpdate(new Date());
      failCount.current = 0;
    } catch (err) {
      failCount.current++;
      // After 2 failed attempts, show demo data
      if (failCount.current >= 2) {
        setStatus(DEMO_STATUS);
        setInstances(DEMO_INSTANCES);
        setStats(DEMO_STATS);
        setIsDemo(true);
        setError(null);
        setLastUpdate(new Date());
      } else {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
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
    isDemo,
    lastUpdate,
    refetch: fetchData,
  };
}
