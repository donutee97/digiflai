import { C } from "../../theme";

export default function KPI({ label, value, unit, icon: Icon, color = C.cyan, sub }) {
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

