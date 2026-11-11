const Telemetry = require("../models/telemetry.model");

class TelemetryRepository {

    async create(data) {
        return Telemetry.create(data);
    }

    async findAll(filters = {}, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        return Telemetry
            .find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
    }

    async findByDrone(droneId, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        return Telemetry
            .find({ droneId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
    }

    async lastPosition(droneId) {
        return Telemetry
            .findOne({ droneId })
            .sort({ createdAt: -1 });
    }

    async findByDateRange(droneId, startDate, endDate, page = 1, limit = 100) {
        const skip = (page - 1) * limit;
        return Telemetry
            .find({
                droneId,
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
    }

    async count(filters = {}) {
        return Telemetry.countDocuments(filters);
    }

}

module.exports = new TelemetryRepository();