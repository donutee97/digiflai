import { useMemo } from "react";
import { Plane } from "lucide-react";
import { C, stateStyle } from "../theme";
import { api } from "../api/client";
import useApiData from "../hooks/useApiData";
import { mapDrone } from "../api/mappers";
import Badge from "../components/ui/badge";
import Panel from "../components/ui/panel";

function TabFlota() {
  const { data: dronesRaw, loading, error } = useApiData(() => api.getDrones(50), []);
  const { data: dashboard } = useApiData(() => api.getDashboard(), []);

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

  if (loading) {
    return (
      <Panel title="Registro de UAV" icon={Plane}>
        <span style={{ color: C.muted }}>Cargando flota desde la base de datos…</span>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Registro de UAV" icon={Plane}>
        <span style={{ color: C.red }}>Error al consultar la API: {error}</span>
      </Panel>
    );
  }

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
          <tbody>
            {drones.map((d) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${C.line}` }}>
                <td className="py-2.5 pr-4" style={{ color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}>{d.id}</td>
                <td className="py-2.5 pr-4" style={{ color: C.text }}>{d.modelo} <span style={{ color: C.muted }}>· {d.fabricante}</span></td>
                <td className="py-2.5 pr-4"><Badge color={(stateStyle[d.estado] || stateStyle.OPERATIVO).c}>{(stateStyle[d.estado] || stateStyle.OPERATIVO).label}</Badge></td>
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

export default TabFlota;
