const express = require("express");

const router = express.Router();

const controller = require("../controllers/mission.controller");

const auth = require("../middleware/auth.middleware");

router.get("/", auth, controller.findAll);

router.post("/", auth, controller.create);

router.put("/:id/finish", auth, controller.finish);

module.exports = router;
