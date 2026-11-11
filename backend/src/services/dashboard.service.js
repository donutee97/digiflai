const prisma = require("../config/prisma");
const Telemetry = require("../models/telemetry.model");

class DashboardService {

    async getDashboard() {

        const [
            totalDrones,
            available,
            inMission,
            maintenance,
            offline,
            totalUsers,
            activeMissions,
            totalAlerts,
            criticalAlerts
        ] = await Promise.all([

            prisma.drone.count(),

            prisma.drone.count({
                where:{status:"AVAILABLE"}
            }),

            prisma.drone.count({
                where:{status:"IN_MISSION"}
            }),

            prisma.drone.count({
                where:{status:"MAINTENANCE"}
            }),

            prisma.drone.count({
                where:{status:"OFFLINE"}
            }),

            prisma.user.count(),

            prisma.mission.count({
                where:{
                    status:"RUNNING"
                }
            }),

            prisma.alert.count(),

            prisma.alert.count({
                where:{
                    level:"CRITICAL",
                    attended:false
                }
            })

        ]);

        const telemetry = await Telemetry.aggregate([

            {
                $sort:{
                    createdAt:-1
                }
            },

            {
                $group:{
                    _id:"$droneId",
                    battery:{
                        $first:"$battery"
                    },
                    speed:{
                        $first:"$speed"
                    },
                    altitude:{
                        $first:"$altitude"
                    },
                    latitude:{
                        $first:"$latitude"
                    },
                    longitude:{
                        $first:"$longitude"
                    },
                    signal:{
                        $first:"$signalStrength"
                    },
                    updatedAt:{
                        $first:"$createdAt"
                    }
                }
            }

        ]);

        const averageBattery =
            telemetry.length === 0
                ? 0
                : telemetry.reduce(
                    (sum,t)=>sum+t.battery,
                    0
                ) / telemetry.length;

        return{

            indicators:{

                totalDrones,

                available,

                inMission,

                maintenance,

                offline,

                totalUsers,

                activeMissions,

                totalAlerts,

                criticalAlerts,

                averageBattery:Number(
                    averageBattery.toFixed(2)
                )

            },

            telemetry

        };

    }

}

module.exports=new DashboardService();
