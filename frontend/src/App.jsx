import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, Plane, Activity, AlertTriangle, Wrench, Brain,
  Shield, Battery, Gauge, MapPin, Clock, Cpu, Signal, Thermometer,
  CheckCircle2, XCircle, AlertCircle, Route, Sparkles, History,
  ChevronRight, Satellite, Waves
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

/* ---------------------------------------------------------------
    TOKENS
    bg      #0A0E14  base
    panel   #10161D  card surface
    panel2  #161D26  raised surface
    line    #212B36  hairline
    cyan    #3DDBD9  active / data
    amber   #F2A93B  caution
    red     #E5484D  critical
    green   #5FD68A  nominal
    text    #E7EDF3
    muted   #7C8B9C
    font display/data: IBM Plex Mono | body: IBM Plex Sans
------------------------------------------------------------------*/

const C = {
  bg: "#0A0E14",
  panel: "#10161D",
  panel2: "#161D26",
  line: "#212B36",
  cyan: "#3DDBD9",
  cyanDim: "#1F5D5C",
  amber: "#F2A93B",
  red: "#E5484D",
  green: "#5FD68A",
  text: "#E7EDF3",
  muted: "#7C8B9C",
  faint: "#3A4753",
};

/* ---------------------------------------------------------------
    MOCK DATA — shaped after the DigiflAi schema  
------------------------------------------------------------------*/

const DRONES = [
  { id: "SD-0001", modelo: "Matrice 350 RTK", fabricante: "DJI", estado: "OPERATIVO", bateria: 94, altitud: 118, velocidad: 42, senal: 98, operador: "H. Moreno" },
  { id: "SD-0002", modelo: "Matrice 300 RTK", fabricante: "DJI", estado: "EN_MISION", bateria: 61, altitud: 205, velocidad: 55, senal: 87, operador: "C. Pinilla" },
  { id: "SD-0003", modelo: "Wingtra One", fabricante: "WingtraOne", estado: "MANTENIMIENTO", bateria: 12, altitud: 0, velocidad: 0, senal: 0, operador: "—" },
  { id: "SD-0004", modelo: "Matrice 30T", fabricante: "DJI", estado: "OPERATIVO", bateria: 88, altitud: 96, velocidad: 31, senal: 95, operador: "H. Moreno" },
  { id: "SD-0005", modelo: "Anafi USA", fabricante: "Parrot", estado: "EN_MISION", bateria: 47, altitud: 140, velocidad: 38, senal: 79, operador: "C. Pinilla" },
  { id: "SD-0006", modelo: "Matrice 350 RTK", fabricante: "DJI", estado: "FUERA_SERVICIO", bateria: 0, altitud: 0, velocidad: 0, senal: 0, operador: "—" },
];

const ALERTS = [
  { id: 1, nivel: "CRITICA", tipo: "IA", titulo: "Riesgo de fallo — Motor delantero izq.", dron: "SD-0002", hora: "07:42:11" },
  { id: 2, nivel: "ALTA", tipo: "Vibración", titulo: "Vibración excesiva en hélice #3", dron: "SD-0005", hora: "07:38:04" },
  { id: 3, nivel: "MEDIA", tipo: "Batería", titulo: "Batería por debajo del 15%", dron: "SD-0003", hora: "07:20:55" },
  { id: 4, nivel: "BAJA", tipo: "Señal", titulo: "Fluctuación de enlace GPS", dron: "SD-0005", hora: "06:59:12" },
];

const MISSIONS = [
  { id: "MIS-014", nombre: "Inspección línea 220kV — Tramo Norte", dron: "SD-0002", estado: "EN_CURSO", inicio: "07:10", duracion: "00:32:00" },
  { id: "MIS-013", nombre: "Reconocimiento perimetral planta", dron: "SD-0005", estado: "EN_CURSO", inicio: "07:05", duracion: "00:41:00" },
  { id: "MIS-012", nombre: "Mapeo agrícola lote 7", dron: "SD-0001", estado: "PROGRAMADA", inicio: "09:00", duracion: "—" },
  { id: "MIS-011", nombre: "Inspección térmica subestación", dron: "SD-0004", estado: "FINALIZADA", inicio: "05:30", duracion: "00:28:00" },
];

const MAINTENANCE = [
  { id: "MT-108", componente: "Motor XM450 · trasero der.", dron: "SD-0003", tipo: "CORRECTIVO", responsable: "J. Salas", estado: "EN PROCESO", costo: 420000 },
  { id: "MT-107", componente: "Batería TB65 · principal", dron: "SD-0006", tipo: "PREVENTIVO", responsable: "J. Salas", estado: "PENDIENTE", costo: 180000 },
  { id: "MT-106", componente: "ESC controlador vuelo", dron: "SD-0006", tipo: "PREDICTIVO", responsable: "A. Rúa", estado: "COMPLETADO", costo: 260000 },
];

const PREDICTIONS = [
  { componente: "Motor delantero izq.", dron: "SD-0002", probabilidad: 94, riesgo: "CRITICO", modelo: "LSTM v2.1", recomendacion: "Reemplazar rodamiento antes de próxima misión." },
  { componente: "Hélice #3", dron: "SD-0005", probabilidad: 78, riesgo: "ALTO", modelo: "LSTM v2.1", recomendacion: "Inspección visual y balanceo." },
  { componente: "Batería TB65", dron: "SD-0006", probabilidad: 52, riesgo: "MEDIO", modelo: "RandomForest v1.4", recomendacion: "Monitorear ciclos de carga." },
  { componente: "Sensor IMU", dron: "SD-0004", probabilidad: 21, riesgo: "BAJO", modelo: "LSTM v2.1", recomendacion: "Sin acción requerida." },
];

function genTelemetry() {
  const out = [];
  let bat = 96, temp = 33, vib = 1.8;
  for (let i = 0; i < 24; i++) {
    bat -= Math.random() * 0.6;
    temp += (Math.random() - 0.5) * 1.4;
    vib += (Math.random() - 0.45) * 0.3;
    out.push({
      t: `${String(7).padStart(2, "0")}:${String(i * 2).padStart(2, "0")}`,
      bateria: Math.max(40, +bat.toFixed(1)),
      temperatura: +Math.max(28, temp).toFixed(1),
      vibracion: +Math.max(0.4, vib).toFixed(2),
      altitud: 90 + Math.round(Math.sin(i / 3) * 40 + Math.random() * 8),
    });
  }
  return out;
}
const TELEMETRY = genTelemetry();

/* ---------------------------------------------------------------
    PRIMITIVES
------------------------------------------------------------------*/

const stateStyle = {
  OPERATIVO: { c: C.green, label: "Operativo" },
  EN_MISION: { c: C.cyan, label: "En misión" },
  MANTENIMIENTO: { c: C.amber, label: "Mantenimiento" },
  FUERA_SERVICIO: { c: C.red, label: "Fuera de servicio" },
};

const nivelStyle = {
  CRITICA: C.red, ALTA: C.amber, MEDIA: "#E0C64A", BAJA: C.muted,
  CRITICO: C.red, ALTO: C.amber, MEDIO: "#E0C64A", BAJO: C.green,
};

function Badge({ children, color }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase font-medium"
      style={{ color, border: `1px solid ${color}55`, background: `${color}14`, fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

function Panel({ title, icon: Icon, right, children, className = "" }) {
  return (
    <div
      className={`rounded-md overflow-hidden ${className}`}
      style={{ background: C.panel, border: `1px solid ${C.line}` }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `1px solid ${C.line}` }}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} style={{ color: C.cyan }} />}
          <span
            className="text-[11px] tracking-[0.18em] uppercase"
            style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {title}
          </span>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function KPI({ label, value, unit, icon: Icon, color = C.cyan, sub }) {
  return (
    <div
      className="rounded-md p-4 flex flex-col gap-2"
      style={{ background: C.panel, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
          {label}
        </span>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold" style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>
          {value}
        </span>
        {unit && <span className="text-xs" style={{ color: C.muted }}>{unit}</span>}
      </div>
      {sub && <span className="text-[11px]" style={{ color: C.muted }}>{sub}</span>}
    </div>
  );
}

/* ---- Signature element: fleet sweep radar ---- */
function FleetRadar({ drones }) {
  const size = 220, cx = size / 2, cy = size / 2, R = 92;
  const [sweep, setSweep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSweep((s) => (s + 2) % 360), 40);
    return () => clearInterval(id);
  }, []);
  const rings = [1, 0.66, 0.33];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size}>
      <defs>
        <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.cyan} stopOpacity="0.35" />
          <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>
      {rings.map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * r} fill="none" stroke={C.line} strokeWidth="1" />
      ))}
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={C.line} strokeWidth="1" />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={C.line} strokeWidth="1" />
      <g transform={`rotate(${sweep} ${cx} ${cy})`}>
        <path d={`M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx + R * Math.cos(Math.PI / 6)} ${cy - R * Math.sin(Math.PI / 6)} Z`} fill="url(#sweepGrad)" />
        <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.cyan} strokeWidth="1.5" opacity="0.8" />
      </g>
      {drones.map((d, i) => {
        const angle = (i / drones.length) * Math.PI * 2;
        const rr = R * (0.35 + (d.bateria / 100) * 0.55);
        const x = cx + rr * Math.cos(angle);
        const y = cy + rr * Math.sin(angle);
        const color = stateStyle[d.estado]?.c || C.muted;
        return (
          <g key={d.id}>
            <circle cx={x} cy={y} r={5} fill={C.bg} stroke={color} strokeWidth="1.5" />
            <circle cx={x} cy={y} r={2} fill={color} />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill={C.cyan} />
      <text x={cx} y={cy + R + 16} textAnchor="middle" fontSize="9" fill={C.muted} fontFamily="'IBM Plex Mono', monospace" letterSpacing="1">
        RADIO = CARGA DE BATERÍA
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------------
    TABS
------------------------------------------------------------------*/

const NAV = [
  { id: "dashboard", label: "Panel general", icon: LayoutDashboard },
  { id: "flota", label: "Flota UAV", icon: Plane },
  { id: "telemetria", label: "Telemetría", icon: Activity },
  { id: "misiones", label: "Misiones", icon: Route },
  { id: "alertas", label: "Alertas", icon: AlertTriangle },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench },
  { id: "ia", label: "Inteligencia artificial", icon: Brain },
  { id: "gemelo", label: "Gemelo digital", icon: Satellite },
];

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

function TabFlota() {
  return (
    <Panel title="Registro de UAV" icon={Plane}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] uppercase tracking-wider text-left">
              <th className="pb-2 pr-4">Serial</th>
              <th className="pb-2 pr-4">Modelo</th>
              <th className="pb-2 pr-4">Estado</th>
              <th className="pb-2 pr-4">Batería</th>
              <th className="pb-2 pr-4">Altitud</th>
              <th className="pb-2 pr-4">Velocidad</th>
              <th className="pb-2 pr-4">Señal</th>
              <th className="pb-2 pr-4">Operador</th>
            </tr>
          </thead>
          <tbody>np
            {DRONES.map((d) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="py-2.5 pr-4" style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>{d.id}</td>
                <td className="py-2.5 pr-4" style={{ color: C.text }}>{d.modelo} <span style={{ color: C.muted }}>· {d.fabricante}</span></td>
                <td className="py-2.5 pr-4"><Badge color={stateStyle[d.estado].c}>{stateStyle[d.estado].label}</Badge></td>
                <td className="py-2.5 pr-4" style={{ color: d.bateria < 20 ? C.red : C.text }}>{d.bateria}%</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{d.altitud} m</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{d.velocidad} km/h</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{d.senal}%</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{d.operador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function TabTelemetria() {
  const [drone, setDrone] = useState("SD-0002");
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={`Variables sincronizadas — ${drone}`}
        icon={Activity}
        right={
          <select
            value={drone}
            onChange={(e) => setDrone(e.target.value)}
            className="text-xs rounded px-2 py-1 outline-none"
            style={{ background: C.panel2, color: C.text, border: `1px solid ${C.line}`, fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {DRONES.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
          </select>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={TELEMETRY}>
            <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke={C.faint} tick={{ fill: C.muted, fontSize: 10 }} />
            <YAxis stroke={C.faint} tick={{ fill: C.muted, fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, fontSize: 12, color: C.text }} />
            <Line type="monotone" dataKey="altitud" stroke={C.cyan} dot={false} strokeWidth={2} name="Altitud (m)" />
            <Line type="monotone" dataKey="temperatura" stroke={C.amber} dot={false} strokeWidth={2} name="Temperatura (°C)" />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="GPS lat/long" value="5.71 / -75.61" icon={MapPin} color={C.cyan} />
        <KPI label="Vibración" value={TELEMETRY[TELEMETRY.length - 1].vibracion} unit="g" icon={Waves} color={C.amber} />
        <KPI label="Temperatura" value={TELEMETRY[TELEMETRY.length - 1].temperatura} unit="°C" icon={Thermometer} color={C.red} />
        <KPI label="Batería" value={TELEMETRY[TELEMETRY.length - 1].bateria} unit="%" icon={Battery} color={C.green} />
      </div>
    </div>
  );
}

function TabMisiones() {
  const estColor = { EN_CURSO: C.cyan, PROGRAMADA: C.amber, FINALIZADA: C.green };
  return (
    <Panel title="Plan de vuelo — misiones" icon={Route}>
      <div className="flex flex-col divide-y" style={{ borderColor: C.line }}>
        {MISSIONS.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-3" style={{ borderColor: C.line }}>
            <div className="flex flex-col gap-1">
              <span className="text-sm" style={{ color: C.text }}>{m.nombre}</span>
              <span className="text-[11px] flex items-center gap-2" style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
                <Plane size={11} /> {m.dron} <Clock size={11} /> {m.inicio} · {m.duracion}
              </span>
            </div>
            <Badge color={estColor[m.estado]}>{m.estado.replace("_", " ")}</Badge>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TabAlertas() {
  const icon = { CRITICA: XCircle, ALTA: AlertTriangle, MEDIA: AlertCircle, BAJA: CheckCircle2 };
  return (
    <Panel title="Alertas del sistema" icon={AlertTriangle}>
      <div className="flex flex-col divide-y" style={{ borderColor: C.line }}>
        {ALERTS.map((a) => {
          const Icon = icon[a.nivel];
          const color = nivelStyle[a.nivel];
          return (
            <div key={a.id} className="flex items-start gap-3 py-3" style={{ borderColor: C.line }}>
              <Icon size={16} style={{ color, marginTop: 2 }} />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.text }}>{a.titulo}</span>
                  <Badge color={color}>{a.nivel}</Badge>
                </div>
                <span className="text-[11px]" style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Tipo: {a.tipo} · {a.dron} · {a.hora}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TabMantenimiento() {
  const estColor = { "EN PROCESO": C.amber, PENDIENTE: C.red, COMPLETADO: C.green };
  return (
    <Panel title="Registro de mantenimiento" icon={Wrench}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] uppercase tracking-wider text-left">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Componente</th>
              <th className="pb-2 pr-4">UAV</th>
              <th className="pb-2 pr-4">Tipo</th>
              <th className="pb-2 pr-4">Responsable</th>
              <th className="pb-2 pr-4">Estado</th>
              <th className="pb-2 pr-4">Costo</th>
            </tr>
          </thead>
          <tbody>
            {MAINTENANCE.map((m) => (
              <tr key={m.id} style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="py-2.5 pr-4" style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>{m.id}</td>
                <td className="py-2.5 pr-4" style={{ color: C.text }}>{m.componente}</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{m.dron}</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{m.tipo}</td>
                <td className="py-2.5 pr-4" style={{ color: C.muted }}>{m.responsable}</td>
                <td className="py-2.5 pr-4"><Badge color={estColor[m.estado]}>{m.estado}</Badge></td>
                <td className="py-2.5 pr-4" style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>
                  ${m.costo.toLocaleString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function TabIA() {
  return (
    <Panel title="Predicciones y recomendaciones — modelos IA" icon={Brain}>
      <div className="flex flex-col gap-4">
        {PREDICTIONS.map((p) => (
          <div key={p.componente} className="rounded p-3" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu size={14} style={{ color: C.cyan }} />
                <span className="text-sm" style={{ color: C.text }}>{p.componente}</span>
                <span className="text-[11px]" style={{ color: C.muted }}>· {p.dron}</span>
              </div>
              <Badge color={nivelStyle[p.riesgo]}>{p.riesgo}</Badge>
            </div>
            <div className="h-1.5 rounded-full w-full overflow-hidden mb-2" style={{ background: C.line }}>
              <div className="h-full rounded-full" style={{ width: `${p.probabilidad}%`, background: nivelStyle[p.riesgo] }} />
            </div>
            <div className="flex items-center justify-between text-[11px]" style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
              <span>Modelo: {p.modelo}</span>
              <span>Probabilidad de fallo: {p.probabilidad}%</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[13px]" style={{ color: C.text }}>
              <Sparkles size={12} style={{ color: C.amber }} />
              {p.recomendacion}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TabGemelo() {
  const vars = [
    { k: "Temperatura", real: "34.2 °C", virtual: "34.0 °C" },
    { k: "Vibración", real: "2.3 g", virtual: "2.1 g" },
    { k: "RPM motores", real: "3208", virtual: "3210" },
    { k: "Batería", real: "94 %", virtual: "94 %" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel title="UAV físico — SD-0001" icon={Plane}>
        <div className="flex flex-col gap-3">
          {vars.map((v) => (
            <div key={v.k} className="flex items-center justify-between text-sm">
              <span style={{ color: C.muted }}>{v.k}</span>
              <span style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>{v.real}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Gemelo digital — modelo v5" icon={Satellite} right={<Badge color={C.green}>Sincronizado</Badge>}>
        <div className="flex flex-col gap-3">
          {vars.map((v) => (
            <div key={v.k} className="flex items-center justify-between text-sm">
              <span style={{ color: C.muted }}>{v.k}</span>
              <span style={{ color: C.cyan, fontFamily: "'IBM Plex Mono', monospace" }}>{v.virtual}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Comparación real vs. virtual" icon={History} className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={TELEMETRY}>
            <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" stroke={C.faint} tick={{ fill: C.muted, fontSize: 10 }} />
            <YAxis stroke={C.faint} tick={{ fill: C.muted, fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.line}`, fontSize: 12, color: C.text }} />
            <Line type="monotone" dataKey="temperatura" stroke={C.text} dot={false} strokeWidth={1.5} name="Real" />
            <Line type="monotone" dataKey="vibracion" stroke={C.cyan} dot={false} strokeWidth={1.5} name="Virtual (escala)" />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------
    APP SHELL
------------------------------------------------------------------*/

export default function DigiflAiApp() {
  const [tab, setTab] = useState("dashboard");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const content = useMemo(() => {
    switch (tab) {
      case "dashboard": return <TabDashboard />;
      case "flota": return <TabFlota />;
      case "telemetria": return <TabTelemetria />;
      case "misiones": return <TabMisiones />;
      case "alertas": return <TabAlertas />;
      case "mantenimiento": return <TabMantenimiento />;
      case "ia": return <TabIA />;
      case "gemelo": return <TabGemelo />;
      default: return null;
    }
  }, [tab]);

  return (
    <div
      className="w-full min-h-screen flex"
      style={{ background: C.bg, color: C.text, fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        table { font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ borderRight: `1px solid ${C.line}`, background: C.panel }}>
        <div className="px-4 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.line}` }}>
          <Shield size={18} style={{ color: C.cyan }} />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>DIGIFLAI</span>
            <span className="text-[10px] tracking-[0.2em]" style={{ color: C.muted }}>DRONE OPS</span>
          </div>
        </div>
        <nav className="flex-1 py-2">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors"
                style={{
                  color: active ? C.cyan : C.muted,
                  background: active ? `${C.cyan}10` : "transparent",
                  borderLeft: `2px solid ${active ? C.cyan : "transparent"}`,
                }}
              >
                <n.icon size={14} />
                {n.label}
                {active && <ChevronRight size={12} className="ml-auto" />}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3 text-[10px]" style={{ borderTop: `1px solid ${C.line}`, color: C.faint, fontFamily: "'IBM Plex Mono', monospace" }}>
          PostgreSQL · MongoDB · MQTT
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top status bar */}
        <header
          className="flex items-center justify-between px-6 py-3"
          style={{ borderBottom: `1px solid ${C.line}`, background: C.panel }}
        >
          <div className="flex items-center gap-4 text-[11px]" style={{ color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
              SISTEMA EN LÍNEA
            </span>
            <span className="flex items-center gap-1.5"><Signal size={12} /> Broker MQTT: Mosquitto</span>
            <span className="flex items-center gap-1.5"><Cpu size={12} /> IA: LSTM v2.1 activo</span>
          </div>
          <div className="text-[12px]" style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>
            {clock.toLocaleTimeString("es-CO", { hour12: false })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h1 className="text-lg font-semibold" style={{ color: C.text }}>
              {NAV.find((n) => n.id === tab)?.label}
            </h1>
            <p className="text-[12px]" style={{ color: C.muted }}>
              Centro de control de operaciones — flota de UAV, telemetría IoT y gemelo digital
            </p>
          </div>
          {content}
        </main>
      </div>
    </div>
  );
}
