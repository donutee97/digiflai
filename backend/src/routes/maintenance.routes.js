const express=require("express");

const router=express.Router();

const auth=require("../middleware/auth.middleware");

const controller=require("../controllers/maintenance.controller");

router.post("/",auth,controller.create);

router.put("/:id/finish",auth,controller.finish);

router.get("/history/:droneId",auth,controller.history);

module.exports=router;
