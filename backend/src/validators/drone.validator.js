const Joi = require("joi");

const createDrone = Joi.object({

    code:Joi.string().required(),

    serial:Joi.string().required(),

    manufacturer:Joi.string().required(),

    model:Joi.string().required(),

    firmware:Joi.string().allow("",null),

    battery:Joi.number().min(0).max(100).required(),

    status:Joi.string(),

    userId:Joi.number().allow(null)

});

const updateDrone = Joi.object({

    manufacturer:Joi.string(),

    model:Joi.string(),

    firmware:Joi.string(),

    battery:Joi.number().min(0).max(100),

    status:Joi.string(),

    userId:Joi.number().allow(null)

});

module.exports={

    createDrone,

    updateDrone

};
