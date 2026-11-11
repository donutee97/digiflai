require("./config/env");

const http = require("http");
const fs = require("fs");
const path = require("path");

const app = require("./app");
const connectMongo = require("./config/database");
const socket = require("./sockets/socket");
const mqtt = require("./mqtt/mqtt.client");
const logger = require("./utils/logger");

const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const server = http.createServer(app);

const io = socket.initialize(server);

mqtt.initialize(io);

connectMongo();

const PORT = Number(process.env.PORT) || 4000;

server.listen(PORT, () => {
    logger.info(`Servidor iniciado en http://localhost:${PORT}`);
    logger.info(`Entorno: ${process.env.NODE_ENV || "development"}`);
    logger.info(`CORS permitido: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        logger.error(`El puerto ${PORT} ya está en uso.`);
    } else {
        logger.error(`Error del servidor: ${error.message}`);
    }
    process.exit(1);
});

function shutdown(signal) {
    logger.info(`Recibida señal ${signal}. Cerrando servidor...`);
    server.close(async () => {
        try {
            const mongoose = require("mongoose");
            await mongoose.connection.close();
        } catch (error) {
            // sin conexión activa
        }
        process.exit(0);
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", { promise, reason });
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", { error });
    process.exit(1);
});
