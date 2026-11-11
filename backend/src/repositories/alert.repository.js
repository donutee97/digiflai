const { PrismaClient } = require("@prisma/client");
const prisma = require("../config/prisma");

class AlertRepository {

    async create(data) {
        return prisma.alert.create({
            data,
            include: {
                drone: true
            }
        });
    }

    async findAll(filters = {}) {
        return prisma.alert.findMany({
            where: filters,
            include: {
                drone: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async findById(id) {
        return prisma.alert.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                drone: true
            }
        });
    }

    async findUnattendedByDroneAndTitle(droneId, title) {
        return prisma.alert.findFirst({
            where: {
                droneId: Number(droneId),
                title,
                attended: false
            }
        });
    }

    async markAsAttended(id) {
        return prisma.alert.update({
            where: {
                id: Number(id)
            },
            data: {
                attended: true
            }
        });
    }

    async delete(id) {
        return prisma.alert.delete({
            where: {
                id: Number(id)
            }
        });
    }

}

module.exports = new AlertRepository();
