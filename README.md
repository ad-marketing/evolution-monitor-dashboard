# Evolution Monitor Dashboard

Dashboard web para monitoramento em tempo real das instâncias da [Evolution API](https://github.com/EvolutionAPI/evolution-api) v2.x.

Desenvolvido em **React + Vite + TailwindCSS**, servido via **Nginx** em container Docker.

## Funcionalidades

- **Status em tempo real**: Visualização do estado de todas as instâncias
- **Indicadores visuais**: Cards com contadores (online, offline, reconectadas, ignoradas)
- **Tabela de instâncias**: Lista detalhada com status, tentativas e última verificação
- **Auto-refresh**: Atualiza automaticamente a cada 15 segundos
- **Tela de Configurações**: 3 abas (Evolution | Telegram | Template)
  - **Evolution**: URL da API, API Key Global, Intervalo de verificação
  - **Telegram**: Token do Bot, Chat ID + tutorial integrado
  - **Template**: Editor de mensagem personalizável com variáveis dinâmicas
- **Teste de notificação**: Botão para enviar notificação de teste antes de salvar
- **Modo demo**: Exibe dados de exemplo quando não há API conectada
- **Proxy integrado**: Nginx faz proxy das requisições `/api/*` para o monitor Go
- **Integração Traefik**: Labels prontas para SSL automático via Let's Encrypt

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

    volumes:
      - monitor_data:/data

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

volumes:
  monitor_data:

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

## Configuração do Telegram

As notificações são enviadas via **Telegram Bot**. Você pode configurar diretamente pelo dashboard (tela de Configurações) ou via variáveis de ambiente.

### Como criar um Bot no Telegram

1. Abra o Telegram e busque por **@BotFather**
2. Envie o comando `/newbot`
3. Escolha um nome para o bot (ex: "Monitor Evolution")
4. Escolha um username (ex: `monitor_evolution_bot`)
5. O BotFather retornará o **Token** — copie e use em `TELEGRAM_BOT_TOKEN`

### Como obter o Chat ID

1. Abra o Telegram e busque por **@userinfobot**
2. Envie `/start` — ele retornará seu **Chat ID**
3. Ou: envie uma mensagem para seu bot, depois acesse:
   `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
   O `chat.id` estará na resposta JSON

## Personalização da Mensagem

O template de notificação suporta variáveis dinâmicas:

| Variável | Descrição |
|----------|----------|
| `{{instance_name}}` | Nome da instância que caiu |
| `{{status}}` | Status atual da instância |
| `{{attempts}}` | Número de tentativas de reconexão |
| `{{max_attempts}}` | Máximo de tentativas configurado |
| `{{timestamp}}` | Data/hora do evento |
| `{{server_url}}` | URL da API monitorada |

**Template padrão:**
```
⚠️ *ALERTA - Evolution Monitor*

A instância *{{instance_name}}* não reconectou após {{attempts}}/{{max_attempts}} tentativas.

📊 Status: `{{status}}`
🕐 Horário: {{timestamp}}
🔗 API: {{server_url}}

Verifique o painel ou escaneie o QR Code novamente.
```

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
| Container | Docker |
| Imagem final | ~25MB |

## Estrutura

```
.
├── client/src/
│   ├── components/dashboard/  # Componentes do dashboard
│   ├── hooks/useMonitor.ts    # Hook de conexão com API
│   ├── pages/
│   │   ├── Dashboard.tsx      # Página principal
│   │   └── Settings.tsx       # Configurações (Evolution | Telegram | Template)
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
- [x] Tela de configurações com 3 abas (Evolution | Telegram | Template)
- [x] Configuração da Evolution API via dashboard
- [x] Intervalo de verificação configurável
- [x] Teste de notificação pelo dashboard
- [x] Integração Traefik + Docker Swarm
- [ ] Histórico de eventos (timeline)
- [ ] Gráficos de uptime
- [ ] Autenticação (login)
- [ ] Notificações no browser

---

*Desenvolvido por [Ad Marketing](https://github.com/ad-marketing)*
