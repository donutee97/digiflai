const telemetryRepository = require("../repositories/telemetry.repository");
const droneRepository = require("../repositories/drone.repository");
const socket = require("../sockets/socket");

class PredictiveService{

    async evaluate(droneId){

        const data = await telemetryRepository.findByDrone(droneId, 1, 50);

        if (data.length === 0) {
            return {
                maintenanceRequired: false,
                averageBattery: 0,
                averageTemperature: 0
            };
        }

        const avgBattery =
            data.reduce(
                (a,b) => a + (b.battery || 0),
                0
            ) / data.length;

        const avgTemperature =
            data.reduce(
                (a,b) => a + (b.temperature || 0),
                0
            ) / data.length;

        const maintenanceRequired = avgBattery < 35 || avgTemperature > 75;

        if (maintenanceRequired) {
            const drone = await droneRepository.findById(droneId);
            if (drone) {
                const io = socket.getIO();
                if (io) {
                    io.emit("maintenance:required", {
                        droneId,
                        droneCode: drone.code,
                        averageBattery: Number(avgBattery.toFixed(2)),
                        averageTemperature: Number(avgTemperature.toFixed(2)),
                        timestamp: new Date()
                    });
                }
            }
        }

        return {
            maintenanceRequired,
            averageBattery: Number(avgBattery.toFixed(2)),
            averageTemperature: Number(avgTemperature.toFixed(2))
        };

    }

}

module.exports=new PredictiveService();
