const service=require("../services/maintenance.service");

class MaintenanceController{

    async create(req,res,next){

        try{

            const maintenance=
                await service.create(req.body);

            res.status(201).json({

                success:true,

                data:maintenance

            });

        }catch(error){

            next(error);

        }

    }

    async finish(req,res,next){

        try{

            const response=
                await service.finish(req.params.id);

            res.json({

                success:true,

                data:response

            });

        }catch(error){

            next(error);

        }

    }

    async history(req,res,next){

        try{

            const data=
                await service.history(req.params.droneId);

            res.json({

                success:true,

                data

            });

        }catch(error){

            next(error);

        }

    }

}

module.exports=new MaintenanceController();
