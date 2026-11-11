const prisma = require("../config/prisma");

class DroneRepository {

    async create(data) {

        return prisma.drone.create({

            data,

            include: {

                operator: true

            }

        });

    }

    async findAll(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return prisma.drone.findMany({

            where: filters,

            include: {

                operator: true,

                missions: true,

                alerts: true

            },

            orderBy: {

                createdAt: "desc"

            },
            skip,
            take: Number(limit)

        });

    }

    async findById(id) {

        return prisma.drone.findUnique({

            where: {

                id: Number(id)

            },

            include: {

                operator: true,

                missions: true,

                maintenances: true,

                alerts: true

            }

        });

    }

    async findByCode(code){

        return prisma.drone.findUnique({

            where:{

                code

            }

        });

    }

    async update(id,data){

        return prisma.drone.update({

            where:{

                id:Number(id)

            },

            data,

            include:{

                operator:true

            }

        });

    }

    async delete(id){

        return prisma.drone.delete({

            where:{

                id:Number(id)

            }

        });

    }

}

module.exports = new DroneRepository();
