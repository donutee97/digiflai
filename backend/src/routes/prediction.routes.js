const express = require("express");

const router = express.Router();

const controller = require("../controllers/prediction.controller");

const auth = require("../middleware/auth.middleware");

router.get("/", auth, controller.findAll);

router.get("/drone/:droneId", auth, controller.findByDrone);

module.exports = router;
