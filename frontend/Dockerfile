# ==========================================================
# DigiflAi Frontend - build multi-etapa
#   1. node  -> compila con Vite
#   2. nginx -> sirve los archivos estáticos
# ==========================================================

# ---------- Etapa de build ----------
FROM node:22-alpine AS build

WORKDIR /app

# Dependencias primero (mejor cache de capas)
COPY package*.json ./
RUN npm ci

# Código fuente
COPY . .

# Variables VITE_*: Vite las incrusta en el bundle en tiempo de BUILD.
# Se pueden sobreescribir con --build-arg o desde docker-compose.
ARG VITE_API_URL=http://localhost:4000/api
ARG VITE_SOCKET_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# ---------- Etapa de servido ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
