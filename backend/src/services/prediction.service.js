const repository = require("../repositories/prediction.repository");

class PredictionService {

    async findAll(filters = {}) {
        return repository.findAll(filters);
    }

    async findById(id) {

        const prediction = await repository.findById(id);

        if (!prediction) {
            throw new Error("Predicción no encontrada.");
        }

        return prediction;
    }

    async findByDrone(droneId) {
        return repository.findByDrone(droneId);
    }

}

module.exports = new PredictionService();
