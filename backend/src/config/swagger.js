const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DigiflAi API",
            version: "1.0.0",
            description: "API for drone fleet management - DigiflAi project",
            contact: {
                name: "DigiflAi Team",
                email: "contacto@digiflai.com"
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 4000}`,
                description: "Development server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string" },
                        status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] },
                        roleId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Drone: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        code: { type: "string" },
                        serial: { type: "string" },
                        model: { type: "string" },
                        manufacturer: { type: "string" },
                        battery: { type: "integer", minimum: 0, maximum: 100 },
                        firmware: { type: "string" },
                        status: { type: "string", enum: ["AVAILABLE", "IN_MISSION", "MAINTENANCE", "OFFLINE"] },
                        userId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Mission: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        description: { type: "string" },
                        location: { type: "string" },
                        latitude: { type: "number", format: "float" },
                        longitude: { type: "number", format: "float" },
                        altitude: { type: "number", format: "float" },
                        status: { type: "string", enum: ["PENDING", "RUNNING", "COMPLETED", "CANCELLED"] },
                        droneId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Alert: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        title: { type: "string" },
                        description: { type: "string" },
                        level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                        attended: { type: "boolean" },
                        droneId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },
                Maintenance: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        description: { type: "string" },
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                        droneId: { type: "integer" },
                        technicianId: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },
                Telemetry: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        droneId: { type: "integer" },
                        latitude: { type: "number" },
                        longitude: { type: "number" },
                        altitude: { type: "number" },
                        speed: { type: "number" },
                        battery: { type: "integer", minimum: 0, maximum: 100 },
                        temperature: { type: "number" },
                        humidity: { type: "number" },
                        signalStrength: { type: "integer" },
                        heading: { type: "number" },
                        status: { type: "string" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string" }
                    }
                },
                PaginatedResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: { type: "array", items: {} },
                        total: { type: "integer" },
                        page: { type: "integer" },
                        limit: { type: "integer" }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: "Auth", description: "Authentication endpoints" },
            { name: "Users", description: "User management (Admin only)" },
            { name: "Drones", description: "Drone fleet management" },
            { name: "Telemetry", description: "Real-time drone telemetry" },
            { name: "Missions", description: "Flight mission management" },
            { name: "Alerts", description: "Drone alert management" },
            { name: "Dashboard", description: "Dashboard statistics" },
            { name: "Maintenance", description: "Drone maintenance records" },
            { name: "Reports", description: "PDF/Excel report generation" }
        ]
    },
    apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;