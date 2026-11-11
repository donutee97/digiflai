const mqtt = require("mqtt");
const telemetryService = require("../services/telemetry.service");
const AlertService = require("../services/alert.service");
const PredictiveService = require("../services/predictive.service");
const logger = require("../utils/logger");

const TELEMETRY_TOPIC = "digiflai/telemetry/#";

let io;
let client = null;

function connect() {
    const brokerUrl = process.env.MQTT_BROKER;

    if (!brokerUrl) {
        logger.warn("MQTT_BROKER no definido. MQTT deshabilitado.");
        return null;
    }

    if (client) return client;

    try {
        client = mqtt.connect(brokerUrl, {
            reconnectPeriod: 5000,
            connectTimeout: 10000
        });
    } catch (error) {
        logger.error(`No se pudo crear el cliente MQTT: ${error.message}`);
        client = null;
        return null;
    }

    client.on("connect", () => {
        logger.info(`MQTT conectado a ${brokerUrl}`);
        client.subscribe(TELEMETRY_TOPIC, (error) => {
            if (error) {
                logger.error(`Error al suscribirse a ${TELEMETRY_TOPIC}: ${error.message}`);
            } else {
                logger.info(`Suscrito a ${TELEMETRY_TOPIC}`);
            }
        });
    });

    client.on("reconnect", () => logger.warn("MQTT reconectando..."));
    client.on("offline", () => logger.warn("MQTT offline"));
    client.on("error", (error) => {
        logger.error(`Error MQTT: ${error?.message || error?.code || String(error)}`);
    });

    client.on("message", async (topic, message) => {
        try {
            const telemetry = JSON.parse(message.toString());

            const saved = await telemetryService.create(telemetry);

            if (io) {
                io.emit("telemetry:update", saved);
            }

            await AlertService.evaluate(saved);
            await PredictiveService.evaluate(saved.droneId);
        } catch (error) {
            logger.error(`Error procesando mensaje MQTT (${topic}): ${error.message}`);
        }
    });

    return client;
}

function initialize(socketIo) {
    io = socketIo;
    connect();
}

module.exports = {
    initialize,
    connect,
    TELEMETRY_TOPIC,
    get client() {
        return client;
    }
};
