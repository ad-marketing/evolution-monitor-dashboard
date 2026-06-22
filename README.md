# Evolution Monitor Dashboard

Dashboard web para monitoramento em tempo real das instâncias da [Evolution API](https://github.com/EvolutionAPI/evolution-api) v2.x.

Desenvolvido em **React + Vite + TailwindCSS**, servido via **Nginx** em container Docker.

## Funcionalidades

- **Status em tempo real**: Visualização do estado de todas as instâncias
- **Indicadores visuais**: Cards com contadores (online, offline, reconectadas, ignoradas)
- **Tabela de instâncias**: Lista detalhada com status, tentativas e última verificação
- **Auto-refresh**: Atualiza automaticamente a cada 15 segundos
- **Modo demo**: Exibe dados de exemplo quando não há API conectada
- **Proxy integrado**: Nginx faz proxy das requisições `/api/*` para o monitor Go
- **Integração Traefik**: Labels prontas para SSL automático via Let's Encrypt
- **Tela de Configurações**: 4 abas (Evolution, Telegram, Template, Chatwoot) para gerenciar tudo sem reiniciar containers

## Pré-requisito

Este dashboard consome a API do [Evolution Monitor (Go)](https://github.com/ad-marketing/evolution-monitor-go). Ambos devem rodar na mesma rede Docker.

## Instalação via Portainer (Docker Swarm + Traefik)

1. Vá em **Stacks** → **Add Stack**
2. Dê o nome `evolution-monitor`
3. Cole o conteúdo do `docker-compose.yml` abaixo no editor
4. Substitua os valores das variáveis com seus dados
5. Clique em **Deploy the stack**

## Docker Compose (Stack Completa)

```yaml
version: "3.7"

services:
  ## ====== MONITOR (Backend Go) ======
  evolution-monitor:
    image: admarketing/evolution-monitor-go:latest

    networks:
      - SuaRedeAqui

    environment:
      - TZ=America/Sao_Paulo
      # ====== API MONITORADA ======
      - EVOLUTION_API_URL=https://SUA_URL_EVOLUTION_AQUI
      - EVOLUTION_API_KEY=SUA_API_KEY_AQUI
      # ====== INTERVALO E TENTATIVAS ======
      - CHECK_INTERVAL=60000
      - MAX_RESTART_ATTEMPTS=3
      - WAIT_AFTER_RESTART=10000
      # ====== TELEGRAM (pode ser configurado via dashboard) ======
      - TELEGRAM_BOT_TOKEN=
      - TELEGRAM_CHAT_ID=
      - TELEGRAM_ENABLED=true
      # ====== CHATWOOT RECONNECTOR (pode ser configurado via dashboard) ======
      - CHATWOOT_RECONNECT_ENABLED=false
      - CHATWOOT_RECONNECT_INTERVAL=30
      - CHATWOOT_RECONNECT_ON_RECONNECT=false
      # ====== SERVIDOR HTTP (DASHBOARD API) ======
      - SERVER_PORT=3500
      # ====== CONFIGURAÇÕES AVANÇADAS ======
      - IGNORE_INSTANCES=
      - VERBOSE=false

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  ## ====== DASHBOARD (Frontend React) ======
  evolution-monitor-dashboard:
    image: admarketing/evolution-monitor-dashboard:latest

    networks:
      - SuaRedeAqui

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.evo-monitor-dashboard.rule=Host(`monitor.seudominio.com.br`)
        - traefik.http.routers.evo-monitor-dashboard.entrypoints=websecure
        - traefik.http.routers.evo-monitor-dashboard.priority=1
        - traefik.http.routers.evo-monitor-dashboard.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evo-monitor-dashboard.service=evo-monitor-dashboard
        - traefik.http.services.evo-monitor-dashboard.loadbalancer.server.port=80
        - traefik.http.services.evo-monitor-dashboard.loadbalancer.passHostHeader=true

    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

networks:
  SuaRedeAqui:
    external: true
    name: SuaRedeAqui
```

## O que Substituir

| Placeholder | Descrição | Exemplo |
|-------------|-----------|---------|
| `SUA_URL_EVOLUTION_AQUI` | URL da Evolution API monitorada | `https://evo.seudominio.com.br` |
| `SUA_API_KEY_AQUI` | API Key global da Evolution API | `SUA_CHAVE_AQUI` |
| `monitor.seudominio.com.br` | Subdomínio do dashboard | `monitor.empresa.com.br` |
| `SuaRedeAqui` | Nome da rede overlay (mesma do Traefik) | `MinhaRede` |

## Tela de Configurações

A tela de Configurações (ícone **Config** no cabeçalho) reúne 4 abas para gerenciar o monitor sem reiniciar containers:

| Aba | O que configura |
|-----|------------------|
| **Evolution** | URL da API, API Key e intervalo de verificação |
| **Telegram** | Token do bot, Chat ID, ativação e botão de teste de notificação |
| **Template** | Editor do texto do alerta com variáveis dinâmicas |
| **Chatwoot** | Chatwoot Reconnector — re-sincronização da integração (ver abaixo) |

### Aba Chatwoot (v2.2.0)

O **Chatwoot Reconnector** re-sincroniza automaticamente a integração nativa Evolution ↔ Chatwoot, evitando a perda do vínculo com a inbox quando uma instância reconecta. A aba permite:

- **Ativar/desativar** o reconnector
- **Intervalo periódico** (Modo A) — re-sincroniza todas as instâncias conectadas a cada N minutos (padrão: 30)
- **Re-sincronizar ao reconectar** (Modo B) — re-aplica a integração logo após o monitor reconectar uma instância
- **Re-sincronizar agora** — dispara uma re-sincronização manual imediata

Detalhes técnicos no [README do backend](https://github.com/ad-marketing/evolution-monitor-go#chatwoot-reconnector-v220).

## Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Rodar em modo dev
pnpm run dev

# Build de produção
pnpm run build
```

Para conectar a uma API local do monitor, crie um `.env.local`:
```
VITE_MONITOR_API_URL=http://localhost:3500
```

## Stack Técnica

| Componente | Tecnologia |
|------------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | TailwindCSS 4 + shadcn/ui |
| Servidor | Nginx Alpine |
| Container | Docker multi-stage |
| Imagem final | ~25MB |

## Estrutura

```
.
├── client/src/
│   ├── components/dashboard/  # Componentes do dashboard
│   ├── hooks/useMonitor.ts    # Hook de conexão com API (status/instâncias)
│   ├── hooks/useSettings.ts   # Hook de configurações (settings/chatwoot)
│   ├── pages/Dashboard.tsx    # Página principal
│   ├── pages/Settings.tsx     # Tela de configurações (4 abas)
│   └── index.css              # Tema Command Center
├── Dockerfile                 # Build multi-stage (Node → Nginx)
├── nginx.conf                 # Config Nginx (SPA + proxy API)
├── docker-compose.yml         # Deploy completo (monitor + dashboard)
└── README.md
```

## Roadmap

- [x] Dashboard com status em tempo real
- [x] Indicadores visuais por status
- [x] Tabela de instâncias
- [x] Auto-refresh
- [x] Modo demo
- [x] Integração Traefik + Docker Swarm
- [x] Tela de Configurações (Evolution, Telegram, Template)
- [x] Aba Chatwoot — Chatwoot Reconnector (v2.2.0)
- [ ] Histórico de eventos (timeline)
- [ ] Gráficos de uptime
- [ ] Autenticação (login)
- [ ] Notificações no browser

---

*Desenvolvido por [Ad Marketing](https://github.com/ad-marketing)*
