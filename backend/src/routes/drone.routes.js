const express = require("express");

const router = express.Router();

const controller = require("../controllers/drone.controller");

const auth = require("../middleware/auth.middleware");

const role = require("../middleware/role.middleware");

const validate = require("../middleware/validate.middleware");

const { createDrone, updateDrone } = require("../validators/drone.validator");

router.get(
    "/",
    auth,
    controller.findAll
);

router.get(
    "/:id",
    auth,
    controller.findById
);

router.post(
    "/",
    auth,
    role(["ADMIN", "SUPERVISOR"]),
    validate(createDrone),
    controller.create
);

router.put(
    "/:id",
    auth,
    role(["ADMIN", "SUPERVISOR"]),
    validate(updateDrone),
    controller.update
);

router.delete(
    "/:id",
    auth,
    role(["ADMIN"]),
    controller.delete
);

module.exports = router;
