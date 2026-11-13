const service = require("../services/prediction.service");

class PredictionController {

    async findAll(req, res, next) {

        try {

            const filters = {};

            if (req.query.droneId) {
                filters.droneId = Number(req.query.droneId);
            }

            if (req.query.risk) {
                filters.risk = req.query.risk;
            }

            const data = await service.findAll(filters);

            res.json({
                success: true,
                data
            });

        } catch (error) {
            next(error);
        }

    }

    async findByDrone(req, res, next) {

        try {

            const data = await service.findByDrone(req.params.droneId);

            res.json({
                success: true,
                data
            });

        } catch (error) {
            next(error);
        }

    }

}

module.exports = new PredictionController();
