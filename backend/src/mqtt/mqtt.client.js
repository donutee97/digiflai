const mqtt = require("mqtt");
const telemetryService = require("../services/telemetry.service");
const AlertService = require("../services/alert.service");
const PredictiveService = require("../services/predictive.service");

let io;

const client = mqtt.connect(process.env.MQTT_BROKER);

function initialize(socketIo) {

    io = socketIo;

    client.on("connect", () => {

        console.log("✅ MQTT conectado");

        client.subscribe("digiflai/telemetry/#");

    });

    client.on("message", async (topic, message) => {

        try {

            const telemetry = JSON.parse(message.toString());

            const saved = await telemetryService.create(telemetry);

            io.emit("telemetry:update", saved);

            await AlertService.evaluate(saved);

            await PredictiveService.evaluate(saved.droneId);

        } catch (error) {

            console.error(error);

        }

    });

}

module.exports = {

    initialize,

    client

};
