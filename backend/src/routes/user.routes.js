const express = require("express");

const router = express.Router();

const controller = require("../controllers/user.controller");

const auth = require("../middleware/auth.middleware");

const role = require("../middleware/role.middleware");

const validate = require("../middleware/validate.middleware");

const { createUser, updateUser } = require("../validators/user.validator");

// Solo administradores

router.get(
    "/",
    auth,
    role(["ADMIN"]),
    controller.findAll
);

router.get(
    "/:id",
    auth,
    role(["ADMIN"]),
    controller.findById
);

router.post(
    "/",
    auth,
    role(["ADMIN"]),
    validate(createUser),
    controller.create
);

router.put(
    "/:id",
    auth,
    role(["ADMIN"]),
    validate(updateUser),
    controller.update
);

router.delete(
    "/:id",
    auth,
    role(["ADMIN"]),
    controller.delete
);

module.exports = router;
