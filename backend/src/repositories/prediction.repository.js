const prisma = require("../config/prisma");

class PredictionRepository {

    async create(data) {
        return prisma.prediction.create({
            data,
            include: {
                drone: true
            }
        });
    }

    async findAll(filters = {}) {
        return prisma.prediction.findMany({
            where: filters,
            include: {
                drone: true
            },
            orderBy: {
                probability: "desc"
            }
        });
    }

    async findById(id) {
        return prisma.prediction.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                drone: true
            }
        });
    }

    async findByDrone(droneId) {
        return prisma.prediction.findMany({
            where: {
                droneId: Number(droneId)
            },
            include: {
                drone: true
            },
            orderBy: {
                probability: "desc"
            }
        });
    }

}

module.exports = new PredictionRepository();
