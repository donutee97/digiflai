const prisma = require("../config/prisma");

class UserRepository {

    async create(data) {
        return prisma.user.create({
            data,
            include: {
                role: true
            }
        });
    }

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: {
                email
            },
            include: {
                role: true
            }
        });
    }

    async findById(id) {
        return prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                role: true
            }
        });
    }

    async findAll(page = 1, limit = 10, search = "") {

        const skip = (page - 1) * limit;

        const where = {

            deletedAt: null,

            OR: [

                {
                    firstName: {
                        contains: search,
                        mode: "insensitive"
                    }
                },

                {
                    lastName: {
                        contains: search,
                        mode: "insensitive"
                    }
                },

                {
                    email: {
                        contains: search,
                        mode: "insensitive"
                    }
                }

            ]

        };

        const users = await prisma.user.findMany({

            where,

            skip,

            take: Number(limit),

            include: {
                role: true
            },

            orderBy: {
                createdAt: "desc"
            }

        });

        const total = await prisma.user.count({
            where
        });

        return {
            total,
            page,
            limit,
            users
        };

    }

    async update(id, data) {

        return prisma.user.update({

            where: {
                id: Number(id)
            },

            data,

            include: {
                role: true
            }

        });

    }

    async softDelete(id) {

        return prisma.user.update({

            where: {
                id: Number(id)
            },

            data: {

                deletedAt: new Date(),

                status: "INACTIVE"

            }

        });

    }

}

module.exports = new UserRepository();
