const repository=require("../repositories/maintenance.repository");
const droneRepository = require("../repositories/drone.repository");

class MaintenanceService{

    async create(data){

        await droneRepository.update(data.droneId, { status: "MAINTENANCE" });

        return repository.create(data);

    }

    async finish(id){

        const maintenance=
            await repository.finish(id);

        await droneRepository.update(maintenance.droneId, { status: "AVAILABLE" });

        return maintenance;

    }

    async history(droneId, page = 1, limit = 10){

        return repository.findByDrone(droneId, page, limit);

    }

    async findAll(filters = {}, page = 1, limit = 10){

        return repository.findAll(filters, page, limit);

    }

}

module.exports=new MaintenanceService();
