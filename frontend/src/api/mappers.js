/* ------------------------------------------------------------------
   Traducción de los datos de la API al formato que usan los
   componentes visuales (estado, nivel, nombres, horas).
------------------------------------------------------------------ */

export const STATUS_TO_ESTADO = {
    AVAILABLE: "OPERATIVO",
    IN_MISSION: "EN_MISION",
    MAINTENANCE: "MANTENIMIENTO",
    OFFLINE: "FUERA_SERVICIO"
};

export const LEVEL_TO_NIVEL = {
    CRITICAL: "CRITICA",
    HIGH: "ALTA",
    MEDIUM: "MEDIA",
    LOW: "BAJA"
};

export function operatorName(operator) {
    if (!operator) return "—";
    return `${operator.firstName} ${operator.lastName}`.trim();
}

export function formatTime(value, withSeconds = false) {
    if (!value) return "—";

    return new Date(value).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        ...(withSeconds && { second: "2-digit" }),
        hour12: false
    });
}

export function mapDrone(drone, telemetry) {
    return {
        id: drone.code,
        modelo: drone.model,
        fabricante: drone.manufacturer,
        estado: STATUS_TO_ESTADO[drone.status] || "OPERATIVO",
        bateria: telemetry?.battery ?? drone.battery ?? 0,
        altitud: telemetry?.altitude ?? 0,
        velocidad: telemetry?.speed ?? 0,
        senal: telemetry?.signal ?? 0,
        operador: operatorName(drone.operator)
    };
}

export function mapAlert(alert) {
    return {
        id: alert.id,
        nivel: LEVEL_TO_NIVEL[alert.level] || "BAJA",
        tipo: alert.level,
        titulo: alert.title,
        dron: alert.drone?.code || "—",
        hora: formatTime(alert.createdAt, true)
    };
}

export function mapPrediction(prediction) {
    return {
        componente: prediction.component,
        dron: prediction.drone?.code || "—",
        probabilidad: prediction.probability,
        riesgo: prediction.risk,
        modelo: prediction.model,
        recomendacion: prediction.recommendation
    };
}

export function mapMission(mission) {
    return {
        id: mission.id,
        nombre: mission.name,
        dron: mission.drone?.code || "—",
        estado: mission.status,
        inicio: formatTime(mission.createdAt),
        duracion: "—"
    };
}

export function mapTelemetryPoint(point) {
    return {
        t: formatTime(point.createdAt),
        bateria: point.battery ?? 0,
        temperatura: point.temperature ?? 0,
        vibracion: point.vibration ?? 0,
        altitud: point.altitude ?? 0
    };
}
