#!/usr/bin/env bash
# ==========================================================
# DigiflAi - control de servicios del proyecto
#
# Uso:
#   ./scripts/digiflai.sh status
#   ./scripts/digiflai.sh stop
#   ./scripts/digiflai.sh start
#   ./scripts/digiflai.sh restart
#   ./scripts/digiflai.sh logs
#
# Qué hace:
#   - Backend local (node src/server.js) en el puerto 4000.
#   - MongoDB y MQTT con Docker.
#   - Frontend con Docker (Nginx) en el puerto 5173.
#
# Qué NO hace:
#   - No apaga el PostgreSQL local (es un servicio del sistema y puede
#     tener otras bases de datos). Solo verifica que esté en 5432.
#   - No arranca los contenedores "api" ni "postgres" de docker-compose.
# ==========================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RUN_DIR="$ROOT/.run"
PID_FILE="$RUN_DIR/backend.pid"
LOG_FILE="$RUN_DIR/backend.log"

API_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:5173"

mkdir -p "$RUN_DIR"

info() {
    printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"
}

fail() {
    printf '\nERROR: %s\n' "$*" >&2
    exit 1
}

backend_pid() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid="$(cat "$PID_FILE" 2>/dev/null || true)"
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        fi
    fi

    if command -v lsof >/dev/null 2>&1; then
        lsof -ti tcp:4000 2>/dev/null | head -n1 || true
    elif command -v fuser >/dev/null 2>&1; then
        fuser 4000/tcp 2>/dev/null | tr -s ' ' '\n' | head -n1 || true
    fi
}

stop_backend() {
    local pid
    pid="$(backend_pid || true)"

    if [ -z "$pid" ]; then
        info "Backend: no estaba corriendo."
        rm -f "$PID_FILE"
        return 0
    fi

    info "Backend: deteniendo PID $pid..."
    kill "$pid" 2>/dev/null || true

    local i=0
    while [ "$i" -lt 20 ]; do
        kill -0 "$pid" 2>/dev/null || break
        i=$((i + 1))
        sleep 0.25
    done

    kill -9 "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    info "Backend: detenido."
}

stop_all() {
    stop_backend

    info "Docker: deteniendo contenedores del proyecto..."
    docker compose stop || true

    info "Listo. Servicios del proyecto detenidos."
    info "PostgreSQL local NO se tocó (sigue en localhost:5432)."
}

wait_mongo() {
    local i=0 id status

    while [ "$i" -lt 60 ]; do
        id="$(docker compose ps -q mongodb 2>/dev/null || true)"
        if [ -n "$id" ]; then
            status="$(docker inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null || true)"
            [ "$status" = "healthy" ] && return 0
        fi
        i=$((i + 1))
        sleep 1
    done

    return 1
}

wait_api() {
    local i=0

    while [ "$i" -lt 60 ]; do
        curl -fsS "$API_URL/health" >/dev/null 2>&1 && return 0
        i=$((i + 1))
        sleep 1
    done

    return 1
}

start_all() {
    command -v docker >/dev/null 2>&1 || fail "Docker no está instalado."
    command -v node >/dev/null 2>&1 || fail "Node.js no está instalado."
    command -v curl >/dev/null 2>&1 || fail "curl no está instalado."

    pg_isready -h localhost -p 5432 >/dev/null 2>&1 \
        || fail "PostgreSQL local no responde en localhost:5432. Enciéndalo antes de continuar."

    info "Docker: levantando MongoDB y MQTT..."
    docker compose up -d mongodb mqtt

    info "Docker: esperando a que MongoDB esté healthy..."
    wait_mongo || fail "MongoDB no quedó healthy. Revise: docker compose logs mongodb"

    info "Docker: levantando frontend sin arrancar el contenedor api..."
    docker compose up -d --no-deps frontend

    info "Backend: arrancando node src/server.js..."
    (
        cd "$ROOT/backend"
        nohup node src/server.js >"$LOG_FILE" 2>&1 &
        echo $! >"$PID_FILE"
    )

    info "Backend: esperando a que la API responda..."
    wait_api || fail "La API no respondió. Revise: tail -n 100 $LOG_FILE"

    status_all
}

status_all() {
    local pid front_code

    echo
    echo "============================================================"
    echo " DigiflAi - estado de servicios"
    echo "============================================================"

    echo
    echo "Backend local"
    if curl -fsS "$API_URL/health" 2>/dev/null; then
        echo
    else
        echo "  API: NO responde en $API_URL"
    fi

    pid="$(backend_pid || true)"
    if [ -n "$pid" ]; then
        echo "  PID: $pid"
        ps -p "$pid" -o pid=,command= || true
    else
        echo "  Proceso: no encontrado"
    fi

    echo
    echo "Docker"
    docker compose ps --format "table {{.Name}}\t{{.Service}}\t{{.Status}}\t{{.Ports}}" || true

    echo
    echo "PostgreSQL local"
    pg_isready -h localhost -p 5432 || true

    echo
    echo "Frontend"
    front_code="$(curl -s -o /dev/null -w '%{http_code}' "$FRONTEND_URL" 2>/dev/null || true)"
    echo "  $FRONTEND_URL -> HTTP ${front_code:-sin respuesta}"

    echo
    echo "URLs"
    echo "  Panel:   $FRONTEND_URL"
    echo "  API:     $API_URL"
    echo "  Swagger: $API_URL/api-docs"
    echo "  Log:     $LOG_FILE"
    echo "============================================================"
}

show_logs() {
    [ -f "$LOG_FILE" ] || fail "Todavía no existe $LOG_FILE. Arranque el backend primero."
    tail -n 100 -f "$LOG_FILE"
}

case "${1:-}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        start_all
        ;;
    status)
        status_all
        ;;
    logs)
        show_logs
        ;;
    *)
        cat <<EOF
Uso: $0 {start|stop|restart|status|logs}

  start    Levanta MongoDB, MQTT, frontend y el backend local.
  stop     Detiene el backend y todos los contenedores del proyecto.
  restart  Hace stop y luego start.
  status   Muestra el estado de cada servicio.
  logs     Sigue el log del backend en vivo.
EOF
        exit 1
        ;;
esac
