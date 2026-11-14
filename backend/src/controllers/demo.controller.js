const service = require("../services/demo.service");

class DemoController {

    async reset(req, res, next) {

        try {

            const result = await service.reset();

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            next(error);
        }

    }

}

module.exports = new DemoController();
