import React, { useMemo } from "react";
import { Plane, Route, AlertTriangle, Brain, Satellite, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import { C, stateStyle, nivelStyle } from "../theme";
import { api } from "../api/client";
import useApiData from "../hooks/useApiData";
import {
    mapDrone,
    mapAlert,
    mapPrediction,
    mapTelemetryPoint
} from "../api/mappers";
import Badge from "../components/ui/badge";
import Panel from "../components/ui/panel";
import KPI from "../components/ui/KPI";
import FleetRadar from "../components/charts/FleetRadar";

function TabDashboard() {
    const { data: dashboard, loading: loadingDashboard, error: dashboardError } = useApiData(
        () => api.getDashboard(),
        []
    );
    const { data: dronesRaw, loading: loadingDrones, error: dronesError } = useApiData(
        () => api.getDrones(50),
        []
    );
    const { data: alertsRaw, loading: loadingAlerts, error: alertsError } = useApiData(
        () => api.getAlerts(),
        []
    );
    const { data: missionsRaw, loading: loadingMissions, error: missionsError } = useApiData(
        () => api.getMissions(),
        []
    );
    const { data: predictionsRaw, loading: loadingPredictions, error: predictionsError } = useApiData(
        () => api.getPredictions(),
        []
    );

    const sd0002 = useMemo(
        () => (dronesRaw || []).find((drone) => drone.code === "SD-0002"),
        [dronesRaw]
    );

    const { data: telemetryRaw, loading: loadingTelemetry, error: telemetryError } = useApiData(
        () => (sd0002 ? api.getTelemetryByDrone(sd0002.id, 24) : Promise.resolve([])),
        [sd0002?.id]
    );

    const latestByDrone = useMemo(() => {
        const map = {};
        (dashboard?.telemetry || []).forEach((point) => {
            map[point._id] = point;
        });
        return map;
    }, [dashboard]);

    const drones = useMemo(
        () => (dronesRaw || []).map((drone) => mapDrone(drone, latestByDrone[drone.id])),
        [dronesRaw, latestByDrone]
    );
    const alerts = useMemo(() => (alertsRaw || []).map(mapAlert), [alertsRaw]);
    const missions = useMemo(() => missionsRaw || [], [missionsRaw]);
    const predictions = useMemo(
        () => (predictionsRaw || []).map(mapPrediction),
        [predictionsRaw]
    );
    const telemetry = useMemo(
        () => (telemetryRaw || []).slice().reverse().map(mapTelemetryPoint),
        [telemetryRaw]
    );

    const loading =
        loadingDashboard ||
        loadingDrones ||
        loadingAlerts ||
        loadingMissions ||
        loadingPredictions ||
        loadingTelemetry;

    const error =
        dashboardError ||
        dronesError ||
        alertsError ||
        missionsError ||
        predictionsError ||
        telemetryError;

    if (loading) {
        return (
            <Panel title="Panel general" icon={Activity}>
                <span style={{ color: C.muted }}>Cargando datos desde la base de datos…</span>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel title="Panel general" icon={Activity}>
                <span style={{ color: C.red }}>Error al consultar la API: {error}</span>
            </Panel>
        );
    }

    const indicators = dashboard?.indicators || {};
    const operativos = (indicators.available || 0) + (indicators.inMission || 0);
    const criticas = indicators.criticalAlerts || 0;
    const enCurso = indicators.activeMissions || 0;
    const altoRiesgo = predictions.filter((prediction) => prediction.probabilidad >= 70).length;

    return (
    <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Flota activa" value={operativos} unit={`/ ${indicators.totalDrones || drones.length}`} icon={Plane} color={C.green} sub="UAV operativos o en misión" />
        <KPI label="Misiones en curso" value={enCurso} icon={Route} color={C.cyan} sub={`${missions.length} programadas hoy`} />
        <KPI label="Alertas críticas" value={criticas} icon={AlertTriangle} color={C.red} sub={`${alerts.length} activas en total`} />
        <KPI label="Riesgo alto (IA)" value={altoRiesgo} icon={Brain} color={C.amber} sub="componentes ≥ 70% probabilidad" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Mapa de flota — radar" icon={Satellite} className="lg:col-span-1">
            <FleetRadar drones={drones} />
            <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stateStyle).map(([k, v]) => (
                <Badge key={k} color={v.c}>{v.label}</Badge>
            ))}
            </div>
        </Panel>

        <Panel title="Telemetría — SD-0002 (últimas 24 lecturas)" icon={Activity} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={telemetry}>
                <defs>
                <linearGradient id="batGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                </linearGradient>
                </defs>
                <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" stroke={C.faint} tick={{ fill: C.muted, fontSize: 10 }} />
                <YAxis stroke={C.faint} tick={{ fill: C.muted, fontSize: 10 }} width={30} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, fontSize: 12, color: C.text }} />
                <Area type="monotone" dataKey="bateria" stroke={C.cyan} fill="url(#batGrad)" strokeWidth={2} name="Batería %" />
            </AreaChart>
            </ResponsiveContainer>
        </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Últimas alertas" icon={AlertTriangle}>
            <div className="flex flex-col divide-y" style={{ borderColor: C.line }}>
            {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5" style={{ borderColor: C.line }}>
                <div className="flex flex-col gap-1">
                    <span className="text-sm" style={{ color: C.text }}>{a.titulo}</span>
                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{a.dron} · {a.hora}</span>
                </div>
                <Badge color={nivelStyle[a.nivel]}>{a.nivel}</Badge>
                </div>
            ))}
            </div>
        </Panel>

        <Panel title="Predicciones de fallo — IA" icon={Brain}>
            <div className="flex flex-col gap-3">
            {predictions.slice(0, 3).map((p) => (
                <div key={p.componente} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                    <span style={{ color: C.text }}>{p.componente}</span>
                    <span style={{ color: nivelStyle[p.riesgo], fontFamily: "'IBM Plex Mono', monospace" }}>{p.probabilidad}%</span>
                </div>
                <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: C.line }}>
                    <div className="h-full rounded-full" style={{ width: `${p.probabilidad}%`, background: nivelStyle[p.riesgo] }} />
                </div>
                </div>
            ))}
            </div>
        </Panel>
        </div>
    </div>
    );
}

export default TabDashboard;
