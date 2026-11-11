const userService = require("../services/user.service");
const { createUser, updateUser } = require("../validators/user.validator");

class UserController {

    async create(req, res, next) {

        try {

            const user = await userService.create(req.body);

            return res.status(201).json({
                success: true,
                message: "Usuario creado correctamente.",
                data: user
            });

        } catch (error) {
            next(error);
        }

    }

    async findAll(req, res, next) {

        try {

            const users = await userService.findAll(req.query);

            return res.json({
                success: true,
                data: users
            });

        } catch (error) {
            next(error);
        }

    }

    async findById(req, res, next) {

        try {

            const user = await userService.findById(req.params.id);

            return res.json({
                success: true,
                data: user
            });

        } catch (error) {
            next(error);
        }

    }

    async update(req, res, next) {

        try {

            const user = await userService.update(
                req.params.id,
                req.body
            );

            return res.json({
                success: true,
                message: "Usuario actualizado correctamente.",
                data: user
            });

        } catch (error) {
            next(error);
        }

    }

    async delete(req, res, next) {

        try {

            const response = await userService.delete(req.params.id);

            return res.json({
                success: true,
                ...response
            });

        } catch (error) {
            next(error);
        }

    }

}

module.exports = new UserController();
