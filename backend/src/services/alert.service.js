const repository = require("../repositories/alert.repository");
const droneRepository = require("../repositories/drone.repository");

class AlertService {

    async create(data) {
        return repository.create(data);
    }

    async findAll(query) {

        const filters = {};

        if (query.level) {
            filters.level = query.level;
        }

        if (query.attended !== undefined) {
            filters.attended = query.attended === "true";
        }

        return repository.findAll(filters);
    }

    async findById(id) {

        const alert = await repository.findById(id);

        if (!alert) {
            throw new Error("Alerta no encontrada.");
        }

        return alert;
    }

    async attend(id) {

        await this.findById(id);

        return repository.markAsAttended(id);
    }

    async delete(id) {

        await this.findById(id);

        return repository.delete(id);
    }

    async evaluate(telemetry) {
        const drone = await droneRepository.findById(telemetry.droneId);
        
        if (!drone) {
            return null;
        }

        const alerts = [];

        if (telemetry.battery !== undefined && telemetry.battery < 20) {
            alerts.push({
                title: "Batería baja",
                description: `El dron ${drone.code} tiene batería al ${telemetry.battery}%`,
                level: "CRITICAL",
                droneId: drone.id
            });
        }

        if (telemetry.temperature !== undefined && telemetry.temperature > 80) {
            alerts.push({
                title: "Temperatura alta",
                description: `El dron ${drone.code} tiene temperatura de ${telemetry.temperature}°C`,
                level: "HIGH",
                droneId: drone.id
            });
        }

        if (telemetry.signalStrength !== undefined && telemetry.signalStrength < 30) {
            alerts.push({
                title: "Señal débil",
                description: `El dron ${drone.code} tiene señal al ${telemetry.signalStrength}%`,
                level: "MEDIUM",
                droneId: drone.id
            });
        }

        const createdAlerts = [];
        for (const alert of alerts) {
            const existing = await repository.findUnattendedByDroneAndTitle(drone.id, alert.title);
            if (!existing) {
                createdAlerts.push(await this.create(alert));
            }
        }

        return createdAlerts;
    }

}

module.exports = new AlertService();
