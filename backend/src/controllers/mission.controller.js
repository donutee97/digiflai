const service = require("../services/mission.service");

class MissionController {

    async create(req, res, next) {

        try {

            const mission = await service.create(req.body);

            res.status(201).json({
                success: true,
                data: mission
            });

        } catch (error) {
            next(error);
        }

    }

    async findAll(req, res, next) {

        try {

            const data = await service.findAll();

            res.json({
                success: true,
                data
            });

        } catch (error) {
            next(error);
        }

    }

    async finish(req, res, next) {

        try {

            const response = await service.finishMission(req.params.id);

            res.json(response);

        } catch (error) {
            next(error);
        }

    }

}

module.exports = new MissionController();
