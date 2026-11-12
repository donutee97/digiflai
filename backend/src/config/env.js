const path = require("path");
const dotenv = require("dotenv");

// Carga backend/.env sin depender del directorio desde donde se ejecute.
dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];
const RECOMMENDED = ["MONGO_URL", "MQTT_BROKER", "FRONTEND_URL"];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.warn(`[env] Faltan variables obligatorias: ${missing.join(", ")}`);
}

const missingRecommended = RECOMMENDED.filter((key) => !process.env[key]);
if (missingRecommended.length > 0) {
    console.warn(`[env] Faltan variables recomendadas: ${missingRecommended.join(", ")}`);
}

module.exports = process.env;
