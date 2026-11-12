const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectMongo() {
    const uri = process.env.MONGO_URL;

    if (!uri) {
        logger.warn("MONGO_URL no definida. MongoDB no se conectará.");
        return null;
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        logger.info("MongoDB conectado");
        return mongoose.connection;
    } catch (error) {
        logger.error(`No se pudo conectar a MongoDB: ${error.message}`);
        return null;
    }
}

module.exports = connectMongo;
