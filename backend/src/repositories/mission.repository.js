const prisma = require("../config/prisma");

class MissionRepository {

    async create(data) {
        return prisma.mission.create({
            data,
            include: {
                drone: true
            }
        });
    }

    async findAll(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return prisma.mission.findMany({
            where: filters,
            include: {
                drone: true
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: Number(limit)
        });
    }

    async findById(id) {
        return prisma.mission.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                drone: true
            }
        });
    }

    async update(id, data) {
        return prisma.mission.update({
            where: {
                id: Number(id)
            },
            data,
            include: {
                drone: true
            }
        });
    }

    async delete(id) {
        return prisma.mission.delete({
            where: {
                id: Number(id)
            }
        });
    }

}

module.exports = new MissionRepository();
