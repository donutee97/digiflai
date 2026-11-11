const service = require("../services/alert.service");

class AlertController {

    async findAll(req, res, next) {

        try {

            const alerts = await service.findAll(req.query);

            res.json({
                success: true,
                data: alerts
            });

        } catch (error) {
            next(error);
        }

    }

    async attend(req, res, next) {

        try {

            const alert = await service.attend(req.params.id);

            res.json({
                success: true,
                message: "Alerta atendida.",
                data: alert
            });

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            await service.delete(req.params.id);

            res.json({
                success: true,
                message: "Alerta eliminada."
            });

        } catch (error) {
            next(error);
        }

    }

}

module.exports = new AlertController();
