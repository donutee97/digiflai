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

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    logger.info(`Servidor iniciado en puerto ${PORT}`);
    logger.info(`Entorno: ${process.env.NODE_ENV || "development"}`);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", { promise, reason });
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", { error });
    process.exit(1);
});
