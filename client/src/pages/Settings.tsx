/**
 * Settings - Evolution Monitor
 * Design: Command Center — estética operacional escura
 * Abas: Evolution | Telegram | Template | Chatwoot
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowLeft,
  Save,
  Send,
  Server,
  MessageCircle,
  FileText,
  Plug,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const {
    settings,
    isLoading,
    isAvailable,
    refetch,
    saveSettings,
    testNotification,
    resyncChatwoot,
  } = useSettings();

  // Estado local dos formulários
  const [evoUrl, setEvoUrl] = useState("");
  const [evoKey, setEvoKey] = useState("");
  const [evoInterval, setEvoInterval] = useState(60);

  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgEnabled, setTgEnabled] = useState(true);
  const [tgTokenSet, setTgTokenSet] = useState(false);

  const [template, setTemplate] = useState("");

  const [cwEnabled, setCwEnabled] = useState(false);
  const [cwInterval, setCwInterval] = useState(30);
  const [cwOnReconnect, setCwOnReconnect] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resyncing, setResyncing] = useState(false);

  // Sincronizar estado local quando settings carregam
  useEffect(() => {
    setEvoUrl(settings.evolution.api_url || "");
    setEvoKey("");
    setEvoInterval(Math.round((settings.evolution.check_interval || 60000) / 1000));
    setTgToken("");
    setTgTokenSet(settings.telegram.bot_token_set);
    setTgChatId(settings.telegram.chat_id || "");
    setTgEnabled(settings.telegram.enabled);
    setTemplate(settings.message_template.template || "");
    setCwEnabled(settings.chatwoot.enabled);
    setCwInterval(settings.chatwoot.interval_minutes || 30);
    setCwOnReconnect(settings.chatwoot.on_reconnect);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      evolution: {
        api_url: evoUrl.trim(),
        api_key: evoKey.trim(), // vazio = mantém o atual no backend
        check_interval: Math.max(10, evoInterval) * 1000,
      },
      telegram: {
        bot_token: tgToken.trim(), // vazio = mantém o atual
        chat_id: tgChatId.trim(),
        enabled: tgEnabled,
      },
      message_template: { template },
      chatwoot: {
        enabled: cwEnabled,
        interval_minutes: Math.max(1, Math.min(1440, cwInterval)),
        on_reconnect: cwOnReconnect,
      },
    };
    const result = await saveSettings(payload as never);
    setSaving(false);
    if (result.ok) {
      toast.success(result.message);
      setEvoKey("");
      setTgToken("");
    } else {
      toast.error(result.message);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    const result = await testNotification(
      {
        bot_token: tgToken.trim(), // vazio = backend usa o salvo
        chat_id: tgChatId.trim(),
        enabled: tgEnabled,
      },
      template,
    );
    setTesting(false);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const handleResync = async () => {
    setResyncing(true);
    const result = await resyncChatwoot();
    setResyncing(false);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                Configurações
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Evolution Monitor
              </p>
            </div>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-mono border-border/50 hover:border-primary/50 hover:text-primary transition-colors duration-150"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-6 max-w-3xl">
        {!isAvailable && !isLoading && (
          <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3">
            <Server className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-500 font-medium">Monitor offline</span>
              {" — "}as alterações não serão salvas. Verifique a conexão com a
              API.
              <button
                onClick={refetch}
                className="ml-2 underline hover:text-foreground"
              >
                Tentar novamente
              </button>
            </p>
          </div>
        )}

        <Tabs defaultValue="evolution" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 border border-border/50">
            <TabsTrigger value="evolution" className="text-xs gap-1.5">
              <Server className="w-3.5 h-3.5" /> Evolution
            </TabsTrigger>
            <TabsTrigger value="telegram" className="text-xs gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Telegram
            </TabsTrigger>
            <TabsTrigger value="template" className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Template
            </TabsTrigger>
            <TabsTrigger value="chatwoot" className="text-xs gap-1.5">
              <Plug className="w-3.5 h-3.5" /> Chatwoot
            </TabsTrigger>
          </TabsList>

          {/* ===== EVOLUTION ===== */}
          <TabsContent value="evolution" className="mt-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Evolution API</CardTitle>
                <CardDescription className="text-xs">
                  Conexão com a instância da Evolution API monitorada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="evo-url" className="text-xs">
                    URL da API
                  </Label>
                  <Input
                    id="evo-url"
                    placeholder="https://sua-evolution.exemplo.com"
                    value={evoUrl}
                    onChange={(e) => setEvoUrl(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="evo-key" className="text-xs">
                    API Key{" "}
                    <span className="text-muted-foreground">
                      (deixe vazio para manter a atual)
                    </span>
                  </Label>
                  <Input
                    id="evo-key"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={evoKey}
                    onChange={(e) => setEvoKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="evo-interval" className="text-xs">
                    Intervalo de verificação (segundos)
                  </Label>
                  <Input
                    id="evo-interval"
                    type="number"
                    min={10}
                    value={evoInterval}
                    onChange={(e) => setEvoInterval(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 10 segundos. Padrão: 60s.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TELEGRAM ===== */}
          <TabsContent value="telegram" className="mt-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Notificações Telegram</CardTitle>
                <CardDescription className="text-xs">
                  Configure o bot que enviará os alertas de desconexão.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div>
                    <Label className="text-xs">Notificações ativas</Label>
                    <p className="text-xs text-muted-foreground">
                      Enviar alertas via Telegram quando falhar a reconexão.
                    </p>
                  </div>
                  <Switch checked={tgEnabled} onCheckedChange={setTgEnabled} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tg-token" className="text-xs">
                    Bot Token{" "}
                    {tgTokenSet && (
                      <span className="text-emerald-500">(configurado)</span>
                    )}
                    {!tgTokenSet && (
                      <span className="text-muted-foreground">
                        (deixe vazio para manter o atual)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="tg-token"
                    type="password"
                    placeholder="123456789:ABCdef..."
                    value={tgToken}
                    onChange={(e) => setTgToken(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tg-chat" className="text-xs">
                    Chat ID
                  </Label>
                  <Input
                    id="tg-chat"
                    placeholder="-1001234567890"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-foreground/80">
                    Como obter o token e o chat ID
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>
                      Abra o{" "}
                      <span className="font-mono text-primary">@BotFather</span>{" "}
                      no Telegram e use <span className="font-mono">/newbot</span>.
                    </li>
                    <li>Copie o token gerado e cole no campo acima.</li>
                    <li>
                      Inicie uma conversa com seu bot (ou adicione-o ao grupo).
                    </li>
                    <li>
                      Use{" "}
                      <span className="font-mono text-primary">@userinfobot</span>{" "}
                      ou a API getUpdates para descobrir o Chat ID.
                    </li>
                  </ol>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={testing}
                  className="gap-1.5 text-xs border-border/50 hover:border-primary/50 hover:text-primary"
                >
                  {testing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Enviar notificação de teste
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TEMPLATE ===== */}
          <TabsContent value="template" className="mt-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Template da Mensagem</CardTitle>
                <CardDescription className="text-xs">
                  Personalize o texto enviado nos alertas. Suporta Markdown do
                  Telegram.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tpl" className="text-xs">
                    Mensagem
                  </Label>
                  <Textarea
                    id="tpl"
                    rows={10}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="font-mono text-xs leading-relaxed"
                  />
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <p className="text-xs font-medium text-foreground/80 mb-1.5">
                    Variáveis disponíveis
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono text-muted-foreground">
                    <span>{"{{instance_name}}"}</span>
                    <span>{"{{status}}"}</span>
                    <span>{"{{attempts}}"}</span>
                    <span>{"{{max_attempts}}"}</span>
                    <span>{"{{timestamp}}"}</span>
                    <span>{"{{server_url}}"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== CHATWOOT ===== */}
          <TabsContent value="chatwoot" className="mt-4">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-base">Chatwoot Reconnector</CardTitle>
                <CardDescription className="text-xs">
                  Re-sincroniza automaticamente a integração Chatwoot quando uma
                  instância reconecta, evitando a perda do vínculo com a inbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div>
                    <Label className="text-xs">Reconnector ativo</Label>
                    <p className="text-xs text-muted-foreground">
                      Habilita a re-sincronização da integração Chatwoot.
                    </p>
                  </div>
                  <Switch checked={cwEnabled} onCheckedChange={setCwEnabled} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cw-interval" className="text-xs">
                    Intervalo periódico (minutos) — Modo A
                  </Label>
                  <Input
                    id="cw-interval"
                    type="number"
                    min={1}
                    max={1440}
                    value={cwInterval}
                    disabled={!cwEnabled}
                    onChange={(e) => setCwInterval(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Re-sincroniza todas as instâncias conectadas neste intervalo.
                    Entre 1 e 1440 min. Padrão: 30 min.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div>
                    <Label className="text-xs">
                      Re-sincronizar ao reconectar — Modo B
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Re-aplica a integração logo após o monitor reconectar uma
                      instância.
                    </p>
                  </div>
                  <Switch
                    checked={cwOnReconnect}
                    disabled={!cwEnabled}
                    onCheckedChange={setCwOnReconnect}
                  />
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-foreground/80">
                    Como funciona
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O reconector lê a configuração atual do Chatwoot de cada
                    instância (token, inbox, conta) e a re-aplica com{" "}
                    <span className="font-mono">autoCreate</span>, equivalente ao
                    botão "Save / Auto Create" do Evolution Manager. Os dados
                    existentes são preservados.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResync}
                  disabled={resyncing || !cwEnabled}
                  className="gap-1.5 text-xs border-border/50 hover:border-primary/50 hover:text-primary"
                >
                  {resyncing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Re-sincronizar agora
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Barra de ações fixa */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || isLoading}
            className="gap-1.5 text-xs font-mono"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Salvar configurações
          </Button>
        </div>
      </main>
    </div>
  );
}
