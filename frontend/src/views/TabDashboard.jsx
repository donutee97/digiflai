import React from "react";
import { Plane, Route, AlertTriangle, Brain, Satellite, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

import { C, stateStyle, nivelStyle } from "../theme";
import { DRONES, ALERTS, MISSIONS, PREDICTIONS, TELEMETRY } from "../data/mock";
import Badge from "../components/ui/badge";
import Panel from "../components/ui/panel";
import KPI from "../components/ui/KPI";
import FleetRadar from "../components/charts/FleetRadar";

function TabDashboard() {
    const operativos = DRONES.filter((d) => d.estado === "OPERATIVO" || d.estado === "EN_MISION").length;
    const criticas = ALERTS.filter((a) => a.nivel === "CRITICA").length;
    const enCurso = MISSIONS.filter((m) => m.estado === "EN_CURSO").length;
    const altoRiesgo = PREDICTIONS.filter((p) => p.probabilidad >= 70).length;

    return (
    <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Flota activa" value={operativos} unit={`/ ${DRONES.length}`} icon={Plane} color={C.green} sub="UAV operativos o en misión" />
        <KPI label="Misiones en curso" value={enCurso} icon={Route} color={C.cyan} sub={`${MISSIONS.length} programadas hoy`} />
        <KPI label="Alertas críticas" value={criticas} icon={AlertTriangle} color={C.red} sub={`${ALERTS.length} activas en total`} />
        <KPI label="Riesgo alto (IA)" value={altoRiesgo} icon={Brain} color={C.amber} sub="componentes ≥ 70% probabilidad" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Mapa de flota — radar" icon={Satellite} className="lg:col-span-1">
            <FleetRadar drones={DRONES} />
            <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stateStyle).map(([k, v]) => (
                <Badge key={k} color={v.c}>{v.label}</Badge>
            ))}
            </div>
        </Panel>

        <Panel title="Telemetría — SD-0002 (últimas 24 lecturas)" icon={Activity} className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TELEMETRY}>
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
            {ALERTS.map((a) => (
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
            {PREDICTIONS.slice(0, 3).map((p) => (
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