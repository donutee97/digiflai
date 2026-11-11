const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const logger = require("./utils/logger");

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) }
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Demasiadas solicitudes, intente más tarde."
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use("/api/", limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Demasiados intentos de inicio de sesión, intente más tarde."
    }
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "SENTINEL Drone API Documentation"
}));

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});

app.get("/", (req, res) => {
    res.json({
        project: "Sentinel Drone API",
        version: "1.0.0"
    });
});

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);

const droneRoutes = require("./routes/drone.routes");
app.use("/api/drones", droneRoutes);

const telemetryRoutes = require("./routes/telemetry.routes");
app.use("/api/telemetry", telemetryRoutes);

const missionRoutes = require("./routes/mission.routes");
app.use("/api/missions", missionRoutes);

const alertRoutes = require("./routes/alert.routes");
app.use("/api/alerts", alertRoutes);

const dashboardRoutes = require("./routes/dashboard.routes");
app.use("/api/dashboard", dashboardRoutes);

const maintenanceRoutes = require("./routes/maintenance.routes");
app.use("/api/maintenance", maintenanceRoutes);

const reportRoutes = require("./routes/report.routes");
app.use("/api/reports", reportRoutes);

const errorMiddleware = require("./middleware/error.middleware");
app.use(errorMiddleware);

module.exports = app;