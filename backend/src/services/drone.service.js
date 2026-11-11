const repository=require("../repositories/drone.repository");

class DroneService{

    async create(data){

        const exists=await repository.findByCode(data.code);

        if(exists){

            throw new Error("El código del dron ya existe.");

        }

        return repository.create(data);

    }

    async findAll(filters = {}, page = 1, limit = 10) {

        return repository.findAll(filters, page, limit);

    }

    async findById(id){

        const drone=await repository.findById(id);

        if(!drone){

            throw new Error("Drone no encontrado.");

        }

        return drone;

    }

    async update(id,data){

        return repository.update(id,data);

    }

    async delete(id){

        return repository.delete(id);

    }

}

module.exports=new DroneService();
