const express = require("express");

const router = express.Router();

const controller = require("../controllers/telemetry.controller");

const auth = require("../middleware/auth.middleware");

router.post(
    "/",
    auth,
    controller.create
);

router.get(
    "/",
    auth,
    controller.findAll
);

router.get(
    "/drone/:droneId",
    auth,
    controller.findByDrone
);

module.exports = router;
