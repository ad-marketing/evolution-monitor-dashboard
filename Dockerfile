# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY tsconfig.json tsconfig.node.json vite.config.ts components.json ./

# Build args for API URL
ARG VITE_MONITOR_API_URL=""
ENV VITE_MONITOR_API_URL=$VITE_MONITOR_API_URL

# Build
RUN pnpm run build

# Production stage - Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
