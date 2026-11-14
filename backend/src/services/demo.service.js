const prisma = require("../config/prisma");

/* ------------------------------------------------------------------
   Reinicio de la demostración.

   Borra únicamente los registros creados desde la pestaña Operaciones
   (todos llevan el prefijo "[DEMO]") y devuelve los drones y las
   misiones sembradas a su estado inicial.
------------------------------------------------------------------ */

const DEMO_PREFIX = "[DEMO]";

const BASELINE_DRONES = [
    { code: "SD-0001", status: "AVAILABLE" },
    { code: "SD-0002", status: "IN_MISSION" },
    { code: "SD-0003", status: "MAINTENANCE" },
    { code: "SD-0004", status: "AVAILABLE" },
    { code: "SD-0005", status: "IN_MISSION" },
    { code: "SD-0006", status: "OFFLINE" }
];

const BASELINE_MISSIONS = [
    { name: "Inspección línea 220kV — Tramo Norte", status: "RUNNING" },
    { name: "Reconocimiento perimetral planta", status: "RUNNING" },
    { name: "Mapeo agrícola lote 7", status: "PENDING" },
    { name: "Inspección térmica subestación", status: "COMPLETED" }
];

class DemoService {

    async reset() {

        const missions = await prisma.mission.deleteMany({
            where: {
                name: {
                    startsWith: DEMO_PREFIX
                }
            }
        });

        const maintenances = await prisma.maintenance.deleteMany({
            where: {
                description: {
                    startsWith: DEMO_PREFIX
                }
            }
        });

        let restoredDrones = 0;

        for (const drone of BASELINE_DRONES) {

            const result = await prisma.drone.updateMany({
                where: { code: drone.code },
                data: { status: drone.status }
            });

            restoredDrones += result.count;
        }

        for (const mission of BASELINE_MISSIONS) {

            await prisma.mission.updateMany({
                where: { name: mission.name },
                data: { status: mission.status }
            });
        }

        return {
            deletedMissions: missions.count,
            deletedMaintenances: maintenances.count,
            restoredDrones
        };
    }

}

module.exports = new DemoService();
