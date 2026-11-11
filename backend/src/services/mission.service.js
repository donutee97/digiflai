const repository = require("../repositories/mission.repository");
const droneRepository = require("../repositories/drone.repository");
const prisma = require("../config/prisma");

class MissionService {

    async create(data) {

        const drone = await droneRepository.findById(data.droneId);

        if (!drone) {
            throw new Error("Drone no encontrado.");
        }

        if (drone.status !== "AVAILABLE") {
            throw new Error("El drone no está disponible.");
        }

        await droneRepository.update(drone.id, { status: "IN_MISSION" });

        return repository.create(data);

    }

    async findAll(filters = {}, page = 1, limit = 10) {
        return repository.findAll(filters, page, limit);
    }

    async findById(id) {
        return repository.findById(id);
    }

    async finishMission(id) {

        const mission = await repository.findById(id);

        if (!mission) {
            throw new Error("Misión no encontrada.");
        }

        await repository.update(id, { status: "COMPLETED" });

        await droneRepository.update(mission.droneId, { status: "AVAILABLE" });

        return {
            message: "Misión finalizada correctamente."
        };

    }

}

module.exports = new MissionService();
