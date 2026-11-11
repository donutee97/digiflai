const service=require("../services/dashboard.service");

class DashboardController{

    async index(req,res,next){

        try{

            const dashboard=
                await service.getDashboard();

            res.json({

                success:true,

                data:dashboard

            });

        }catch(error){

            next(error);

        }

    }

}

module.exports=new DashboardController();
