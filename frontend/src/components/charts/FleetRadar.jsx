/* ---- Signature element: fleet sweep radar ---- */
import { useState, useEffect } from "react";
import { C, stateStyle } from "../../theme";

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

export default FleetRadar;