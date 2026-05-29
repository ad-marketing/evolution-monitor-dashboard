# Evolution Monitor Dashboard

Dashboard web para monitoramento em tempo real das instâncias da Evolution API.

Desenvolvido em **React + Vite + TailwindCSS**, servido via **Nginx** em container Docker.

## Funcionalidades

- **Status em tempo real**: Visualização do estado de todas as instâncias
- **Indicadores visuais**: Cards com contadores (online, offline, reconectadas, ignoradas)
- **Tabela de instâncias**: Lista detalhada com status, tentativas e última verificação
- **Auto-refresh**: Atualiza automaticamente a cada 15 segundos
- **Modo demo**: Exibe dados de exemplo quando não há API conectada
- **Proxy integrado**: Nginx faz proxy das requisições `/api/*` para o monitor Go
- **Integração Traefik**: Labels prontas para SSL automático

## Pré-requisito

Este dashboard consome a API do [Evolution Monitor (Go)](https://github.com/ad-marketing/evolution-monitor-go). Ambos devem rodar na mesma rede Docker.

## Instalação via Portainer (Docker Swarm + Traefik)

1. Vá em **Stacks** → **Add Stack**
2. Dê o nome `evolution-monitor`
3. Cole o conteúdo do `docker-compose.yml` no editor
4. Preencha as variáveis com seus dados
5. Clique em **Deploy the stack**

O `docker-compose.yml` inclui tanto o **monitor** (backend Go) quanto o **dashboard** (frontend React).

## Instalação via Terminal

```bash
mkdir -p /opt/evolution-monitor && cd /opt/evolution-monitor
# Copie o docker-compose.yml e edite as variáveis
docker stack deploy -c docker-compose.yml evolution-monitor
```

## Configuração

O dashboard se conecta automaticamente ao monitor via proxy Nginx interno. A única configuração necessária é no `docker-compose.yml`:

| Campo | Descrição |
|-------|-----------|
| `monitor.seudominio.com.br` | Subdomínio onde o dashboard será acessível |
| `SuaRedeAqui` | Nome da rede overlay do Traefik |
| Variáveis do monitor | URL, API Key, instância de notificação, etc. |

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
│   ├── hooks/useMonitor.ts    # Hook de conexão com API
│   ├── pages/Dashboard.tsx    # Página principal
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
- [ ] Histórico de eventos (timeline)
- [ ] Gráficos de uptime
- [ ] Autenticação (login)
- [ ] Notificações no browser

---

*Desenvolvido por [Ad Marketing](https://github.com/ad-marketing)*
