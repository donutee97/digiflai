// Orígenes permitidos para CORS y Socket.IO.
// FRONTEND_URL acepta varios orígenes separados por coma:
//   FRONTEND_URL=http://localhost:5173,http://192.168.1.50:5173
function getAllowedOrigins() {
    const raw = process.env.FRONTEND_URL || "http://localhost:5173";
    return raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

function isOriginAllowed(origin) {
    // Sin Origin = peticiones de servidor a servidor, curl o Postman.
    if (!origin) return true;
    return getAllowedOrigins().includes(origin);
}

const corsOptions = {
    origin(origin, callback) {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        // CORS es una protección del navegador: se omite la cabecera y el
        // navegador bloquea la respuesta. No se lanza error para no ensuciar logs.
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Total-Count"]
};

module.exports = { getAllowedOrigins, isOriginAllowed, corsOptions };
