/* ---------------------------------------------------------------
    MOCK DATA — shaped after the SENTINEL DRONE schema  
------------------------------------------------------------------*/

export const DRONES = [
    { id: "SD-0001", modelo: "Matrice 350 RTK", fabricante: "DJI", estado: "OPERATIVO", bateria: 94, altitud: 118, velocidad: 42, senal: 98, operador: "H. Moreno" },
    { id: "SD-0002", modelo: "Matrice 300 RTK", fabricante: "DJI", estado: "EN_MISION", bateria: 61, altitud: 205, velocidad: 55, senal: 87, operador: "C. Pinilla" },
    { id: "SD-0003", modelo: "Wingtra One", fabricante: "WingtraOne", estado: "MANTENIMIENTO", bateria: 12, altitud: 0, velocidad: 0, senal: 0, operador: "—" },
    { id: "SD-0004", modelo: "Matrice 30T", fabricante: "DJI", estado: "OPERATIVO", bateria: 88, altitud: 96, velocidad: 31, senal: 95, operador: "H. Moreno" },
    { id: "SD-0005", modelo: "Anafi USA", fabricante: "Parrot", estado: "EN_MISION", bateria: 47, altitud: 140, velocidad: 38, senal: 79, operador: "C. Pinilla" },
    { id: "SD-0006", modelo: "Matrice 350 RTK", fabricante: "DJI", estado: "FUERA_SERVICIO", bateria: 0, altitud: 0, velocidad: 0, senal: 0, operador: "—" },
];

export const ALERTS = [
    { id: 1, nivel: "CRITICA", tipo: "IA", titulo: "Riesgo de fallo — Motor delantero izq.", dron: "SD-0002", hora: "07:42:11" },
    { id: 2, nivel: "ALTA", tipo: "Vibración", titulo: "Vibración excesiva en hélice #3", dron: "SD-0005", hora: "07:38:04" },
    { id: 3, nivel: "MEDIA", tipo: "Batería", titulo: "Batería por debajo del 15%", dron: "SD-0003", hora: "07:20:55" },
    { id: 4, nivel: "BAJA", tipo: "Señal", titulo: "Fluctuación de enlace GPS", dron: "SD-0005", hora: "06:59:12" },
];

export const MISSIONS = [
    { id: "MIS-014", nombre: "Inspección línea 220kV — Tramo Norte", dron: "SD-0002", estado: "EN_CURSO", inicio: "07:10", duracion: "00:32:00" },
    { id: "MIS-013", nombre: "Reconocimiento perimetral planta", dron: "SD-0005", estado: "EN_CURSO", inicio: "07:05", duracion: "00:41:00" },
    { id: "MIS-012", nombre: "Mapeo agrícola lote 7", dron: "SD-0001", estado: "PROGRAMADA", inicio: "09:00", duracion: "—" },
    { id: "MIS-011", nombre: "Inspección térmica subestación", dron: "SD-0004", estado: "FINALIZADA", inicio: "05:30", duracion: "00:28:00" },
];

export const MAINTENANCE = [
    { id: "MT-108", componente: "Motor XM450 · trasero der.", dron: "SD-0003", tipo: "CORRECTIVO", responsable: "J. Salas", estado: "EN PROCESO", costo: 420000 },
    { id: "MT-107", componente: "Batería TB65 · principal", dron: "SD-0006", tipo: "PREVENTIVO", responsable: "J. Salas", estado: "PENDIENTE", costo: 180000 },
    { id: "MT-106", componente: "ESC controlador vuelo", dron: "SD-0006", tipo: "PREDICTIVO", responsable: "A. Rúa", estado: "COMPLETADO", costo: 260000 },
];

export const PREDICTIONS = [
    { componente: "Motor delantero izq.", dron: "SD-0002", probabilidad: 94, riesgo: "CRITICO", modelo: "LSTM v2.1", recomendacion: "Reemplazar rodamiento antes de próxima misión." },
    { componente: "Hélice #3", dron: "SD-0005", probabilidad: 78, riesgo: "ALTO", modelo: "LSTM v2.1", recomendacion: "Inspección visual y balanceo." },
    { componente: "Batería TB65", dron: "SD-0006", probabilidad: 52, riesgo: "MEDIO", modelo: "RandomForest v1.4", recomendacion: "Monitorear ciclos de carga." },
    { componente: "Sensor IMU", dron: "SD-0004", probabilidad: 21, riesgo: "BAJO", modelo: "LSTM v2.1", recomendacion: "Sin acción requerida." },
];

export function genTelemetry() {
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
export const TELEMETRY = genTelemetry();