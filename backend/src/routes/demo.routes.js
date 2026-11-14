const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const role = require("../middleware/role.middleware");

const controller = require("../controllers/demo.controller");

/* Solo ADMIN puede reiniciar los datos de la demostración. */
router.post("/reset", auth, role("ADMIN", "SUPERVISOR"), controller.reset);

module.exports = router;
