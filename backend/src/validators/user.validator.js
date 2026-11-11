const Joi = require("joi");

const createUser = Joi.object({

    firstName: Joi.string()
        .min(3)
        .max(50)
        .required(),

    lastName: Joi.string()
        .min(3)
        .max(50)
        .required(),

    email: Joi.string()
        .email()
        .required(),

    password: Joi.string()
        .min(8)
        .required(),

    phone: Joi.string()
        .allow("", null),

    roleId: Joi.number()
        .required()

});

const updateUser = Joi.object({

    firstName: Joi.string(),

    lastName: Joi.string(),

    email: Joi.string().email(),

    password: Joi.string().min(8),

    phone: Joi.string(),

    roleId: Joi.number(),

    status: Joi.string()

});

module.exports = {

    createUser,

    updateUser

};
