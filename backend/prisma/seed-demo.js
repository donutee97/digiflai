require("../src/config/env");

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const prisma = require("../src/config/prisma");
const Telemetry = require("../src/models/telemetry.model");

/* ------------------------------------------------------------------
   Datos de demostración — mismos valores que frontend/src/data/mock.js
------------------------------------------------------------------ */

const DEMO_PASSWORD = "digiflai123";

const ROLES = [
    { name: "ADMIN", description: "Administrador del sistema" },
    { name: "OPERATOR", description: "Operador de drones" },
    { name: "TECHNICIAN", description: "Técnico de mantenimiento" },
    { name: "RESEARCHER", description: "Investigador / IA" }
];

const USERS = [
    { firstName: "Dany", lastName: "Tobon", email: "admin@digiflai.com", role: "ADMIN" },
    { firstName: "H.", lastName: "Moreno", email: "h.moreno@digiflai.com", role: "OPERATOR" },
    { firstName: "C.", lastName: "Pinilla", email: "c.pinilla@digiflai.com", role: "OPERATOR" },
    { firstName: "J.", lastName: "Salas", email: "j.salas@digiflai.com", role: "TECHNICIAN" },
    { firstName: "A.", lastName: "Rúa", email: "a.rua@digiflai.com", role: "TECHNICIAN" }
];

const STATUS_MAP = {
    OPERATIVO: "AVAILABLE",
    EN_MISION: "IN_MISSION",
    MANTENIMIENTO: "MAINTENANCE",
    FUERA_SERVICIO: "OFFLINE"
};

const DRONES = [
    { code: "SD-0001", serial: "SN-0000001", modelo: "Matrice 350 RTK", fabricante: "DJI", estado: "OPERATIVO", bateria: 94, altitud: 118, velocidad: 42, senal: 98, operador: "h.moreno@digiflai.com" },
    { code: "SD-0002", serial: "SN-0000002", modelo: "Matrice 300 RTK", fabricante: "DJI", estado: "EN_MISION", bateria: 61, altitud: 205, velocidad: 55, senal: 87, operador: "c.pinilla@digiflai.com" },
    { code: "SD-0003", serial: "SN-0000003", modelo: "Wingtra One", fabricante: "WingtraOne", estado: "MANTENIMIENTO", bateria: 12, altitud: 0, velocidad: 0, senal: 0, operador: null },
    { code: "SD-0004", serial: "SN-0000004", modelo: "Matrice 30T", fabricante: "DJI", estado: "OPERATIVO", bateria: 88, altitud: 96, velocidad: 31, senal: 95, operador: "h.moreno@digiflai.com" },
    { code: "SD-0005", serial: "SN-0000005", modelo: "Anafi USA", fabricante: "Parrot", estado: "EN_MISION", bateria: 47, altitud: 140, velocidad: 38, senal: 79, operador: "c.pinilla@digiflai.com" },
    { code: "SD-0006", serial: "SN-0000006", modelo: "Matrice 350 RTK", fabricante: "DJI", estado: "FUERA_SERVICIO", bateria: 0, altitud: 0, velocidad: 0, senal: 0, operador: null }
];

const MISSIONS = [
    { name: "Inspección línea 220kV — Tramo Norte", code: "SD-0002", status: "RUNNING", hour: "07:10", latitude: 4.7110, longitude: -74.0721, altitude: 120 },
    { name: "Reconocimiento perimetral planta", code: "SD-0005", status: "RUNNING", hour: "07:05", latitude: 4.7231, longitude: -74.0650, altitude: 140 },
    { name: "Mapeo agrícola lote 7", code: "SD-0001", status: "PENDING", hour: "09:00", latitude: 4.6900, longitude: -74.0900, altitude: 100 },
    { name: "Inspección térmica subestación", code: "SD-0004", status: "COMPLETED", hour: "05:30", latitude: 4.7050, longitude: -74.0800, altitude: 90 }
];

const ALERTS = [
    { title: "Riesgo de fallo — Motor delantero izq.", code: "SD-0002", level: "CRITICAL", hour: "07:42:11" },
    { title: "Vibración excesiva en hélice #3", code: "SD-0005", level: "HIGH", hour: "07:38:04" },
    { title: "Batería por debajo del 15%", code: "SD-0003", level: "MEDIUM", hour: "07:20:55" },
    { title: "Fluctuación de enlace GPS", code: "SD-0005", level: "LOW", hour: "06:59:12" }
];

const MAINTENANCES = [
    { component: "Motor XM450 · trasero der.", code: "SD-0003", type: "CORRECTIVO", technician: "j.salas@digiflai.com", state: "EN PROCESO", cost: 420000, startHour: "06:30", endHour: null },
    { component: "Batería TB65 · principal", code: "SD-0006", type: "PREVENTIVO", technician: "j.salas@digiflai.com", state: "PENDIENTE", cost: 180000, startHour: "08:00", endHour: null },
    { component: "ESC controlador vuelo", code: "SD-0006", type: "PREDICTIVO", technician: "a.rua@digiflai.com", state: "COMPLETADO", cost: 260000, startHour: "04:00", endHour: "05:00" }
];

const PREDICTIONS = [
    { component: "Motor delantero izq.", code: "SD-0002", probability: 94, risk: "CRITICO", model: "LSTM v2.1", recommendation: "Reemplazar rodamiento antes de próxima misión." },
    { component: "Hélice #3", code: "SD-0005", probability: 78, risk: "ALTO", model: "LSTM v2.1", recommendation: "Inspección visual y balanceo." },
    { component: "Batería TB65", code: "SD-0006", probability: 52, risk: "MEDIO", model: "RandomForest v1.4", recommendation: "Monitorear ciclos de carga." },
    { component: "Sensor IMU", code: "SD-0004", probability: 21, risk: "BAJO", model: "LSTM v2.1", recommendation: "Sin acción requerida." }
];

/* ------------------------------------------------------------------ */

function todayAt(hour) {
    const [h, m, s = 0] = hour.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, s, 0);
    return d;
}

function genTelemetrySeries() {
    const out = [];
    let bat = 96, temp = 33, vib = 1.8;
    const base = todayAt("07:00");

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
            createdAt: new Date(base.getTime() + i * 2 * 60 * 1000)
        });
    }

    return out;
}

async function seedPostgres() {
    await prisma.role.createMany({ data: ROLES, skipDuplicates: true });

    const roles = await prisma.role.findMany();
    const roleIdByName = Object.fromEntries(roles.map((role) => [role.name, role.id]));

    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    const userIdByEmail = {};

    for (const user of USERS) {
        const saved = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                firstName: user.firstName,
                lastName: user.lastName,
                roleId: roleIdByName[user.role],
                status: "ACTIVE",
                deletedAt: null
            },
            create: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password,
                roleId: roleIdByName[user.role],
                status: "ACTIVE"
            }
        });
        userIdByEmail[user.email] = saved.id;
    }

    // Limpieza en orden por las claves foráneas
    await prisma.prediction.deleteMany();
    await prisma.maintenance.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.drone.deleteMany();

    const droneIdByCode = {};

    for (const drone of DRONES) {
        const saved = await prisma.drone.create({
            data: {
                code: drone.code,
                serial: drone.serial,
                model: drone.modelo,
                manufacturer: drone.fabricante,
                battery: drone.bateria,
                status: STATUS_MAP[drone.estado],
                userId: drone.operador ? userIdByEmail[drone.operador] : null
            }
        });
        droneIdByCode[drone.code] = saved.id;
    }

    for (const mission of MISSIONS) {
        await prisma.mission.create({
            data: {
                name: mission.name,
                description: "Misión de demostración",
                location: "Bogotá, Colombia",
                latitude: mission.latitude,
                longitude: mission.longitude,
                altitude: mission.altitude,
                status: mission.status,
                droneId: droneIdByCode[mission.code],
                createdAt: todayAt(mission.hour)
            }
        });
    }

    for (const alert of ALERTS) {
        await prisma.alert.create({
            data: {
                title: alert.title,
                description: alert.title,
                level: alert.level,
                attended: false,
                droneId: droneIdByCode[alert.code],
                createdAt: todayAt(alert.hour)
            }
        });
    }

    for (const maintenance of MAINTENANCES) {
        await prisma.maintenance.create({
            data: {
                description: `${maintenance.type} · ${maintenance.component} · $${maintenance.cost}`,
                startDate: todayAt(maintenance.startHour),
                endDate: maintenance.endHour ? todayAt(maintenance.endHour) : null,
                droneId: droneIdByCode[maintenance.code],
                technicianId: userIdByEmail[maintenance.technician]
            }
        });
    }

    for (const prediction of PREDICTIONS) {
        await prisma.prediction.create({
            data: {
                component: prediction.component,
                probability: prediction.probability,
                risk: prediction.risk,
                model: prediction.model,
                recommendation: prediction.recommendation,
                droneId: droneIdByCode[prediction.code]
            }
        });
    }

    return droneIdByCode;
}

async function seedMongo(droneIdByCode) {
    if (!process.env.MONGO_URL) {
        console.warn("MONGO_URL no definida. Se omite la telemetría.");
        return 0;
    }

    await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });

    // Colección limpia para que los datos coincidan exactamente con el mock
    await Telemetry.deleteMany({});

    const series = genTelemetrySeries();
    const sd0002 = droneIdByCode["SD-0002"];

    const docs = series.map((point, index) => ({
        droneId: sd0002,
        latitude: 4.71 + index * 0.0002,
        longitude: -74.07 + index * 0.0001,
        altitude: point.altitud,
        speed: 42 + Math.round(Math.random() * 15),
        battery: point.bateria,
        temperature: point.temperatura,
        vibration: point.vibracion,
        signalStrength: 90,
        heading: (index * 15) % 360,
        status: "ONLINE",
        createdAt: point.createdAt
    }));

    // Snapshot más reciente por dron (lo que muestra la tabla de flota)
    const now = Date.now();

    DRONES.forEach((drone, index) => {
        docs.push({
            droneId: droneIdByCode[drone.code],
            latitude: 4.70 + index * 0.004,
            longitude: -74.08 + index * 0.003,
            altitude: drone.altitud,
            speed: drone.velocidad,
            battery: drone.bateria,
            temperature: 31 + index,
            vibration: 1.5 + index * 0.2,
            signalStrength: drone.senal,
            heading: (index * 60) % 360,
            status: drone.estado === "FUERA_SERVICIO" ? "OFFLINE" : "ONLINE",
            createdAt: new Date(now + (index + 1) * 1000)
        });
    });

    await Telemetry.insertMany(docs);

    return docs.length;
}

async function main() {
    console.log("Sembrando datos de demostración...");

    const droneIdByCode = await seedPostgres();
    const telemetryCount = await seedMongo(droneIdByCode);

    console.log("PostgreSQL:");
    console.log(`  usuarios:      ${USERS.length}`);
    console.log(`  drones:        ${DRONES.length}`);
    console.log(`  misiones:      ${MISSIONS.length}`);
    console.log(`  alertas:       ${ALERTS.length}`);
    console.log(`  mantenimiento: ${MAINTENANCES.length}`);
    console.log(`  predicciones:  ${PREDICTIONS.length}`);
    console.log(`MongoDB: ${telemetryCount} lecturas de telemetría`);
    console.log(`Contraseña de usuarios demo: ${DEMO_PASSWORD}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });
