const telemetryRepository = require("../repositories/telemetry.repository");

class TelemetryService {

    async create(data) {

        return telemetryRepository.create(data);

    }

    async findAll(filters = {}, page = 1, limit = 100) {

        return telemetryRepository.findAll(filters, page, limit);

    }

    async findByDrone(droneId, page = 1, limit = 100) {

        return telemetryRepository.findByDrone(droneId, page, limit);

    }

    async lastPosition(droneId) {

        return telemetryRepository.lastPosition(droneId);

    }

    async findByDateRange(droneId, startDate, endDate, page = 1, limit = 100) {

        return telemetryRepository.findByDateRange(droneId, startDate, endDate, page, limit);

    }

}

module.exports = new TelemetryService();
