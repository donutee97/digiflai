const express = require("express");

const router = express.Router();

const controller = require("../controllers/alert.controller");

const auth = require("../middleware/auth.middleware");

router.get("/", auth, controller.findAll);

router.put("/:id/attend", auth, controller.attend);

router.delete("/:id", auth, controller.delete);

module.exports = router;
