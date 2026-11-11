const prisma = require("../config/prisma");

class MaintenanceRepository {

    async create(data) {

        return prisma.maintenance.create({

            data,

            include:{
                drone:true,

                technician:true

            }

        });

    }

    async findAll(filters = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return prisma.maintenance.findMany({

            where: filters,

            include:{

                drone:true,

                technician:true

            },

            orderBy:{

                startDate:"desc"

            },
            skip,
            take: Number(limit)

        });

    }

    async findByDrone(droneId, page = 1, limit = 10){
        const skip = (page - 1) * limit;
        return prisma.maintenance.findMany({

            where:{

                droneId:Number(droneId)

            },

            include:{

                technician:true

            },
            orderBy: {
                startDate: "desc"
            },
            skip,
            take: Number(limit)

        });

    }

    async finish(id){

        return prisma.maintenance.update({

            where:{

                id:Number(id)

            },

            data:{

                endDate:new Date()

            }

        });

    }

}

module.exports=new MaintenanceRepository();