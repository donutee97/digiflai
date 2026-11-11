const telemetryService = require("../services/telemetry.service");

class TelemetryController {

    async create(req, res, next) {

        try {

            const telemetry = await telemetryService.create(req.body);

            return res.status(201).json({

                success: true,

                data: telemetry

            });

        } catch (error) {

            next(error);

        }

    }

    async findAll(req, res, next) {

        try {

            const limit = req.query.limit || 100;

            const data = await telemetryService.findAll(limit);

            return res.json({

                success: true,

                data

            });

        } catch (error) {

            next(error);

        }

    }

    async findByDrone(req, res, next) {

        try {

            const limit = req.query.limit || 100;

            const data = await telemetryService.findByDrone(
                req.params.droneId,
                limit
            );

            return res.json({

                success: true,

                data

            });

        } catch (error) {

            next(error);

        }

    }

}

module.exports = new TelemetryController();
