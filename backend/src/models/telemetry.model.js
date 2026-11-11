const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema({

    droneId: {
        type: Number,
        required: true,
        index: true
    },

    latitude: {
        type: Number,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    },

    altitude: {
        type: Number,
        default: 0
    },

    speed: {
        type: Number,
        default: 0
    },

    battery: {
        type: Number,
        min: 0,
        max: 100
    },

    temperature: {
        type: Number
    },

    humidity: {
        type: Number
    },

    signalStrength: {
        type: Number
    },

    heading: {
        type: Number
    },

    status: {
        type: String,
        default: "ONLINE"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

telemetrySchema.index({
    droneId: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "Telemetry",
    telemetrySchema
);
