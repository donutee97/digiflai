const droneService = require("../services/drone.service");
const { createDrone, updateDrone } = require("../validators/drone.validator");

class DroneController {

    async create(req, res, next) {
        try {

            const drone = await droneService.create(req.body);

            return res.status(201).json({
                success: true,
                message: "Drone registrado correctamente.",
                data: drone
            });

        } catch (error) {
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {

            const filters = {};
            if (req.query.status) filters.status = req.query.status;
            if (req.query.userId) filters.userId = Number(req.query.userId);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const drones = await droneService.findAll(filters, page, limit);

            return res.json({
                success: true,
                data: drones
            });

        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {

            const drone = await droneService.findById(req.params.id);

            return res.json({
                success: true,
                data: drone
            });

        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {

            const drone = await droneService.update(
                req.params.id,
                req.body
            );

            return res.json({
                success: true,
                message: "Drone actualizado correctamente.",
                data: drone
            });

        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {

            await droneService.delete(req.params.id);

            return res.json({
                success: true,
                message: "Drone eliminado correctamente."
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = new DroneController();
