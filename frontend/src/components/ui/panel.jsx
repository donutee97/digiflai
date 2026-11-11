import { C } from "../../theme";

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

export default Panel;