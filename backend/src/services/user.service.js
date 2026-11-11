const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");

class UserService {

    async create(userData) {

        const exists = await userRepository.findByEmail(userData.email);

        if (exists) {
            throw new Error("El correo electrónico ya se encuentra registrado.");
        }

        const password = await bcrypt.hash(userData.password, 10);

        const user = await userRepository.create({
            ...userData,
            password
        });

        delete user.password;

        return user;
    }

    async findAll(query) {

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const search = query.search || "";

        return await userRepository.findAll(page, limit, search);
    }

    async findById(id) {

        const user = await userRepository.findById(id);

        if (!user) {
            throw new Error("Usuario no encontrado.");
        }

        delete user.password;

        return user;
    }

    async update(id, data) {

        const user = await userRepository.findById(id);

        if (!user) {
            throw new Error("Usuario no existe.");
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updated = await userRepository.update(id, data);

        delete updated.password;

        return updated;
    }

    async delete(id) {

        const user = await userRepository.findById(id);

        if (!user) {
            throw new Error("Usuario no encontrado.");
        }

        await userRepository.softDelete(id);

        return {
            message: "Usuario eliminado correctamente."
        };
    }

}

module.exports = new UserService();
