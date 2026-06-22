import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_MONITOR_API_URL || "";

export interface EvolutionSettings {
  api_url: string;
  api_key: string;
  check_interval: number; // em ms
}

export interface TelegramSettings {
  bot_token: string;
  bot_token_set: boolean;
  chat_id: string;
  enabled: boolean;
}

export interface MessageTemplateSettings {
  template: string;
}

export interface ChatwootSettings {
  enabled: boolean;
  interval_minutes: number;
  on_reconnect: boolean;
}

export interface SettingsData {
  evolution: EvolutionSettings;
  telegram: TelegramSettings;
  message_template: MessageTemplateSettings;
  chatwoot: ChatwootSettings;
}

const DEFAULT_SETTINGS: SettingsData = {
  evolution: { api_url: "", api_key: "", check_interval: 60000 },
  telegram: { bot_token: "", bot_token_set: false, chat_id: "", enabled: true },
  message_template: {
    template:
      "🚨 *Instância Desconectada*\n\n📛 *Instância:* {{instance_name}}\n📊 *Status:* {{status}}\n🔄 *Tentativas:* {{attempts}}/{{max_attempts}}\n🕐 *Horário:* {{timestamp}}\n🖥️ *Servidor:* {{server_url}}\n\n⚠️ A reconexão automática falhou. Verifique manualmente.",
  },
  chatwoot: { enabled: false, interval_minutes: 30, on_reconnect: false },
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (!res.ok) throw new Error("Falha ao carregar configurações");
      const text = await res.clone().text();
      if (text.startsWith("<")) throw new Error("API retornou HTML");
      const data = await res.json();
      setSettings({
        evolution: data.evolution ?? DEFAULT_SETTINGS.evolution,
        telegram: data.telegram ?? DEFAULT_SETTINGS.telegram,
        message_template:
          data.message_template ?? DEFAULT_SETTINGS.message_template,
        chatwoot: data.chatwoot ?? DEFAULT_SETTINGS.chatwoot,
      });
      setIsAvailable(true);
      setError(null);
    } catch (err) {
      setIsAvailable(false);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(
    async (payload: Partial<SettingsData>): Promise<{ ok: boolean; message: string }> => {
      try {
        const res = await fetch(`${API_BASE}/api/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { ok: false, message: data.error || "Falha ao salvar" };
        }
        await fetchSettings();
        return { ok: true, message: data.message || "Configurações salvas" };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : "Erro de conexão",
        };
      }
    },
    [fetchSettings],
  );

  const testNotification = useCallback(
    async (
      telegram: { bot_token: string; chat_id: string; enabled: boolean },
      template: string,
    ): Promise<{ ok: boolean; message: string }> => {
      try {
        const res = await fetch(`${API_BASE}/api/settings/test-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram,
            message_template: { template },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return { ok: false, message: data.error || "Falha no teste" };
        }
        return { ok: true, message: data.message || "Notificação enviada" };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : "Erro de conexão",
        };
      }
    },
    [],
  );

  const resyncChatwoot = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    try {
      const res = await fetch(`${API_BASE}/api/chatwoot/resync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.error || "Falha na re-sincronização" };
      }
      return { ok: true, message: data.message || "Re-sincronização iniciada" };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Erro de conexão",
      };
    }
  }, []);

  return {
    settings,
    setSettings,
    isLoading,
    isAvailable,
    error,
    refetch: fetchSettings,
    saveSettings,
    testNotification,
    resyncChatwoot,
  };
}
