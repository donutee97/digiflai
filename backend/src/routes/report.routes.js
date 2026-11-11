const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const role = require("../middleware/role.middleware");

const controller = require("../controllers/report.controller");

router.get(
    "/missions/pdf",
    auth,
    role(["ADMIN", "SUPERVISOR"]),
    controller.missionsPDF
);

router.get(
    "/drones/excel",
    auth,
    role(["ADMIN", "SUPERVISOR"]),
    controller.dronesExcel
);

module.exports = router;
