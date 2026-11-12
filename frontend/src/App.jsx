import { useState, useEffect, useMemo } from "react";
import { C, stateStyle, nivelStyle } from "./theme";
import { DRONES, ALERTS, MISSIONS, MAINTENANCE, PREDICTIONS, TELEMETRY } from "./data/mock";
import Badge from "./components/ui/Badge";
import Panel from "./components/ui/Panel";
import KPI from "./components/ui/KPI";
import FleetRadar from "./components/charts/FleetRadar";
import TabDashboard from "./views/TabDashboard";
import TabFlota from "./views/TabFlota";
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
