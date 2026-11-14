import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  Plane,
  Play,
  RotateCcw,
  Wrench
} from "lucide-react";

import { C, nivelStyle } from "../theme";
import { api } from "../api/client";
import useApiData from "../hooks/useApiData";
import { formatTime } from "../api/mappers";
import Badge from "../components/ui/badge";
import Panel from "../components/ui/panel";
import KPI from "../components/ui/KPI";

const DEMO_PREFIX = "[DEMO]";
const MONO = "'IBM Plex Mono', monospace";

/* ------------------------------------------------------------------
   Pestaña de demostración para el stand.

   Dos flujos reales sobre la misma API:
     A. Elegir un dron disponible → asignar misión → finalizar.
     C. Ver la predicción de la IA → programar mantenimiento → finalizar.

   Todos los registros creados aquí llevan el prefijo [DEMO] para que
   "Reiniciar demo" pueda borrarlos sin tocar los datos sembrados.
------------------------------------------------------------------ */

function Steps({ items, current }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {items.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const color = done ? C.green : active ? C.cyan : C.faint;

        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full text-[10px]"
              style={{
                color,
                border: `1px solid ${color}`,
                background: `${color}12`,
                fontFamily: MONO
              }}
            >
              {done ? "✓" : index + 1}
            </span>
            <span className="text-[11px]" style={{ color: active ? C.text : C.muted }}>
              {label}
            </span>
            {index < items.length - 1 && <ArrowRight size={11} style={{ color: C.faint }} />}
          </div>
        );
      })}
    </div>
  );
}

function ActionButton({ onClick, disabled, busy, icon: Icon, tone = "cyan", children }) {
  const color = tone === "green" ? C.green : tone === "amber" ? C.amber : C.cyan;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded text-[12px] font-medium transition-opacity disabled:opacity-40"
      style={{
        color: C.bg,
        background: color,
        fontFamily: MONO,
        cursor: disabled ? "not-allowed" : "pointer"
      }}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
}

function DataRow({ label, value, mono = false }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-1.5"
      style={{ borderTop: `1px solid ${C.line}` }}
    >
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: C.muted, fontFamily: MONO }}
      >
        {label}
      </span>
      <span
        className="text-[12px] text-right"
        style={{ color: C.text, fontFamily: mono ? MONO : undefined }}
      >
        {value}
      </span>
    </div>
  );
}

function TabOperaciones() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDroneId, setSelectedDroneId] = useState(null);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);

  const { data: dashboard, error: dashboardError } = useApiData(
    () => api.getDashboard(),
    [refreshKey]
  );
  const { data: dronesRaw, error: dronesError } = useApiData(
    () => api.getDrones(50),
    [refreshKey]
  );
  const { data: missionsRaw, error: missionsError } = useApiData(
    () => api.getMissions(),
    [refreshKey]
  );
  const { data: predictionsRaw, error: predictionsError } = useApiData(
    () => api.getPredictions(),
    [refreshKey]
  );
  const { data: maintenancesRaw, error: maintenancesError } = useApiData(
    () => api.getMaintenances(20),
    [refreshKey]
  );
  const { data: usersRaw, error: usersError } = useApiData(
    () => api.getUsers(50),
    [refreshKey]
  );

  const error =
    dashboardError ||
    dronesError ||
    missionsError ||
    predictionsError ||
    maintenancesError ||
    usersError;

  const available = useMemo(
    () => (dronesRaw || []).filter((drone) => drone.status === "AVAILABLE"),
    [dronesRaw]
  );

  const selectedDrone = useMemo(
    () => available.find((drone) => drone.id === selectedDroneId) || available[0] || null,
    [available, selectedDroneId]
  );

  const activeMission = useMemo(
    () =>
      (missionsRaw || []).find(
        (mission) =>
          mission.name?.startsWith(DEMO_PREFIX) &&
          (mission.status === "RUNNING" || mission.status === "PENDING")
      ),
    [missionsRaw]
  );

  const activeMaintenance = useMemo(
    () =>
      (maintenancesRaw || []).find(
        (maintenance) =>
          maintenance.description?.startsWith(DEMO_PREFIX) && !maintenance.endDate
      ),
    [maintenancesRaw]
  );

  const prediction = useMemo(() => (predictionsRaw || [])[0] || null, [predictionsRaw]);

  const technician = useMemo(() => {
    const users = usersRaw?.users || [];
    return (
      users.find((user) => user.role?.name === "TECHNICIAN") ||
      users.find((user) => user.roleId === 3) ||
      null
    );
  }, [usersRaw]);

  const indicators = dashboard?.indicators;

  const isBusy = Boolean(busy);

  async function run(key, action, successMessage) {
    setBusy(key);
    setMessage(null);

    try {
      const result = await action();
      const text =
        typeof successMessage === "function" ? successMessage(result) : successMessage;

      setMessage({ type: "ok", text });
      setRefreshKey((value) => value + 1);
    } catch (actionError) {
      setMessage({
        type: "error",
        text: actionError.message || "No se pudo completar la acción."
      });
    } finally {
      setBusy(null);
    }
  }

  function handleAssignMission() {
    if (!selectedDrone) return;

    run(
      "mission",
      () =>
        api.createMission({
          name: `${DEMO_PREFIX} Inspección de línea ${selectedDrone.code}`,
          description: "Misión creada desde el stand para demostrar el ciclo operativo.",
          location: "Bogotá, Colombia",
          latitude: 4.711,
          longitude: -74.0721,
          altitude: 120,
          status: "RUNNING",
          droneId: selectedDrone.id
        }),
      `${selectedDrone.code} asignado. La misión está en curso.`
    );
  }

  function handleFinishMission() {
    if (!activeMission) return;

    run(
      "finish-mission",
      () => api.finishMission(activeMission.id),
      "Misión completada. El dron volvió a estar operativo."
    );
  }

  function handleCreateMaintenance() {
    if (!prediction) return;

    const droneCode = prediction.drone?.code || "dron";
    const technicianId = technician?.id ?? 4;

    run(
      "maintenance",
      () =>
        api.createMaintenance({
          description: `${DEMO_PREFIX} ${prediction.component} · ${droneCode}`,
          startDate: new Date().toISOString(),
          droneId: prediction.droneId,
          technicianId
        }),
      `${droneCode} pasó a mantenimiento. La flota activa bajó.`
    );
  }

  function handleFinishMaintenance() {
    if (!activeMaintenance) return;

    run(
      "finish-maintenance",
      () => api.finishMaintenance(activeMaintenance.id),
      "Mantenimiento finalizado. El dron vuelve a estar operativo."
    );
  }

  function handleReset() {
    run(
      "reset",
      async () => {
        const result = await api.resetDemo();
        setSelectedDroneId(null);
        return result;
      },
      (result) =>
        `Demo reiniciada: ${result.deletedMissions} misión(es) y ` +
        `${result.deletedMaintenances} mantenimiento(s) eliminados.`
    );
  }

  const technicianName = technician
    ? `${technician.firstName} ${technician.lastName}`.trim()
    : "J. Salas";

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de la demostración */}
      <div
        className="rounded-md px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        style={{ background: C.panel, border: `1px solid ${C.line}` }}
      >
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: C.cyan, fontFamily: MONO }}
          >
            Demostración guiada
          </div>
          <p className="text-[12px] mt-1" style={{ color: C.muted }}>
            Elija un flujo y siga los pasos. Todo se guarda en la base de datos; al terminar,
            use <b style={{ color: C.text }}>Reiniciar demo</b> para dejar el estado inicial.
          </p>
        </div>
        <ActionButton
          tone="amber"
          icon={RotateCcw}
          onClick={handleReset}
          busy={busy === "reset"}
          disabled={isBusy}
        >
          Reiniciar demo
        </ActionButton>
      </div>

      {message && (
        <div
          className="rounded px-4 py-2.5 text-[12px] flex items-center gap-2"
          style={{
            color: message.type === "ok" ? C.green : C.red,
            background: message.type === "ok" ? `${C.green}10` : `${C.red}10`,
            border: `1px solid ${message.type === "ok" ? C.green : C.red}44`
          }}
        >
          {message.type === "ok" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {message.text}
        </div>
      )}

      {error && (
        <div
          className="rounded px-4 py-2.5 text-[12px] flex items-center gap-2"
          style={{ color: C.red, background: `${C.red}10`, border: `1px solid ${C.red}44` }}
        >
          <AlertTriangle size={14} />
          Error al consultar la API: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* ------------------------------------------------ Flujo A */}
        <Panel
          title="Flujo A · Ciclo de misión"
          icon={Plane}
          right={<Badge color={C.cyan}>Operación</Badge>}
        >
          <Steps
            items={["Elegir dron", "Asignar misión", "Finalizar"]}
            current={activeMission ? 1 : 0}
          />

          {activeMission ? (
            <div>
              <Badge color={C.cyan}>Misión en curso</Badge>

              <div className="mt-3">
                <DataRow
                  label="Misión"
                  value={activeMission.name.replace(`${DEMO_PREFIX} `, "")}
                />
                <DataRow label="Dron" value={activeMission.drone?.code || "—"} mono />
                <DataRow
                  label="Estado"
                  value={activeMission.status === "RUNNING" ? "EN CURSO" : activeMission.status}
                  mono
                />
                <DataRow label="Inicio" value={formatTime(activeMission.createdAt, true)} mono />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ActionButton
                  tone="green"
                  icon={CheckCircle2}
                  onClick={handleFinishMission}
                  busy={busy === "finish-mission"}
                  disabled={isBusy}
                >
                  Finalizar misión
                </ActionButton>
                <span className="text-[11px]" style={{ color: C.muted }}>
                  La misión pasa a COMPLETADA y el dron vuelve a OPERATIVO.
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[12px]" style={{ color: C.muted }}>
                Elija un dron disponible. El nombre y las coordenadas de la misión ya vienen
                precargados.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {available.length === 0 && (
                  <span className="text-[12px]" style={{ color: C.amber }}>
                    No hay drones disponibles. Use Reiniciar demo.
                  </span>
                )}

                {available.map((drone) => {
                  const isSelected = selectedDrone?.id === drone.id;

                  return (
                    <button
                      key={drone.id}
                      type="button"
                      onClick={() => setSelectedDroneId(drone.id)}
                      className="text-left rounded px-3 py-2 transition-colors"
                      style={{
                        border: `1px solid ${isSelected ? C.cyan : C.line}`,
                        background: isSelected ? `${C.cyan}12` : C.panel2
                      }}
                    >
                      <div
                        className="text-[12px]"
                        style={{ color: C.text, fontFamily: MONO }}
                      >
                        {drone.code}
                      </div>
                      <div className="text-[10px]" style={{ color: C.muted }}>
                        {drone.model} · batería {drone.battery}%
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ActionButton
                  icon={Play}
                  onClick={handleAssignMission}
                  busy={busy === "mission"}
                  disabled={!selectedDrone || isBusy}
                >
                  Asignar misión
                </ActionButton>
                <span className="text-[11px]" style={{ color: C.muted }}>
                  El dron pasa a EN MISIÓN y sube el indicador de misiones activas.
                </span>
              </div>
            </div>
          )}
        </Panel>

        {/* ------------------------------------------------ Flujo C */}
        <Panel
          title="Flujo C · Mantenimiento predictivo"
          icon={Brain}
          right={<Badge color={C.red}>IA</Badge>}
        >
          <Steps
            items={["Predicción IA", "Programar mantenimiento", "Finalizar"]}
            current={activeMaintenance ? 1 : 0}
          />

          {activeMaintenance ? (
            <div>
              <Badge color={C.amber}>Mantenimiento en curso</Badge>

              <div className="mt-3">
                <DataRow
                  label="Descripción"
                  value={activeMaintenance.description.replace(`${DEMO_PREFIX} `, "")}
                />
                <DataRow label="Dron" value={activeMaintenance.drone?.code || "—"} mono />
                <DataRow
                  label="Técnico"
                  value={
                    activeMaintenance.technician
                      ? `${activeMaintenance.technician.firstName} ${activeMaintenance.technician.lastName}`.trim()
                      : technicianName
                  }
                />
                <DataRow
                  label="Inicio"
                  value={formatTime(activeMaintenance.startDate, true)}
                  mono
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ActionButton
                  tone="green"
                  icon={CheckCircle2}
                  onClick={handleFinishMaintenance}
                  busy={busy === "finish-maintenance"}
                  disabled={isBusy}
                >
                  Finalizar mantenimiento
                </ActionButton>
                <span className="text-[11px]" style={{ color: C.muted }}>
                  Se registra la fecha de fin y el dron vuelve a OPERATIVO.
                </span>
              </div>
            </div>
          ) : prediction ? (
            <div>
              <div
                className="rounded p-3"
                style={{ background: C.panel2, border: `1px solid ${C.line}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: C.muted, fontFamily: MONO }}
                    >
                      Predicción · {prediction.model}
                    </div>
                    <div className="text-[14px] mt-0.5" style={{ color: C.text }}>
                      {prediction.component}
                    </div>
                    <div className="text-[11px]" style={{ color: C.muted }}>
                      Dron {prediction.drone?.code || "—"}
                    </div>
                  </div>
                  <Badge color={nivelStyle[prediction.risk] || C.red}>
                    {prediction.risk}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div
                    className="flex items-center justify-between text-[11px]"
                    style={{ color: C.muted }}
                  >
                    <span>Probabilidad de fallo</span>
                    <span
                      style={{
                        color: nivelStyle[prediction.risk] || C.red,
                        fontFamily: MONO
                      }}
                    >
                      {prediction.probability}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded mt-1.5 overflow-hidden"
                    style={{ background: C.faint }}
                  >
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${prediction.probability}%`,
                        background: nivelStyle[prediction.risk] || C.red
                      }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-[11px]" style={{ color: C.muted }}>
                  <b style={{ color: C.text }}>Recomendación:</b>{" "}
                  {prediction.recommendation}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ActionButton
                  tone="amber"
                  icon={Wrench}
                  onClick={handleCreateMaintenance}
                  busy={busy === "maintenance"}
                  disabled={isBusy}
                >
                  Programar mantenimiento
                </ActionButton>
                <span className="text-[11px]" style={{ color: C.muted }}>
                  Técnico: {technicianName} · descripción precargada.
                </span>
              </div>
            </div>
          ) : (
            <span className="text-[12px]" style={{ color: C.muted }}>
              No hay predicciones disponibles. Ejecute el sembrado de datos de demostración.
            </span>
          )}
        </Panel>
      </div>

      {/* ------------------------------------------------ Indicadores */}
      <Panel
        title="Estado de la flota"
        icon={Activity}
        right={
          <span className="text-[10px]" style={{ color: C.muted, fontFamily: MONO }}>
            Se actualiza con cada acción
          </span>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI
            label="Operativos"
            value={indicators?.available ?? "—"}
            icon={Plane}
            color={C.green}
          />
          <KPI
            label="En misión"
            value={indicators?.inMission ?? "—"}
            icon={Activity}
            color={C.cyan}
          />
          <KPI
            label="Mantenimiento"
            value={indicators?.maintenance ?? "—"}
            icon={Wrench}
            color={C.amber}
          />
          <KPI
            label="Misiones activas"
            value={indicators?.activeMissions ?? "—"}
            icon={Play}
            color={C.cyan}
          />
        </div>
        <p className="mt-3 text-[11px]" style={{ color: C.muted }}>
          Los mismos datos se reflejan en <b style={{ color: C.text }}>Panel general</b> y{" "}
          <b style={{ color: C.text }}>Flota UAV</b>. Si algo queda fuera del estado inicial,
          pulse Reiniciar demo.
        </p>
      </Panel>
    </div>
  );
}

export default TabOperaciones;
