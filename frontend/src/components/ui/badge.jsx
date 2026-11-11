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

export default Badge;