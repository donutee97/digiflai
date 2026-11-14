const swaggerJsdoc = require("swagger-jsdoc");

const paths = require("./swagger.paths");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DigiflAi API",
            version: "1.0.0",
            description: [
                "API para la gestión de flota de drones del proyecto DigiflAi.",
                "",
                "### Cómo autenticarse en esta página",
                "",
                "1. Abra **POST /api/auth/login** y pulse *Try it out*.",
                "2. Use las credenciales de demostración y pulse *Execute*:",
                "   `admin@digiflai.com` / `digiflai123`.",
                "3. Copie el valor de `token` de la respuesta.",
                "4. Pulse el botón **Authorize** (arriba a la derecha) y pegue",
                "   **solo el token**, sin la palabra `Bearer`.",
                "5. Ya puede ejecutar el resto de endpoints con *Try it out*.",
                "",
                "Sin token, las rutas protegidas responden **401**. Si el rol",
                "no alcanza (por ejemplo un OPERATOR creando usuarios),",
                "responden **403**."
            ].join("\n"),
            contact: {
                name: "DigiflAi Team",
                email: "contacto@digiflai.com"
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 4000}`,
                description: "Servidor de desarrollo"
            }
        ],
        paths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                /* ---------------- Autenticación ---------------- */

                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "admin@digiflai.com" },
                        password: { type: "string", example: "digiflai123" }
                    }
                },

                RegisterRequest: {
                    type: "object",
                    required: ["firstName", "lastName", "email", "password", "roleId"],
                    properties: {
                        firstName: { type: "string", minLength: 2, maxLength: 50, example: "Ana" },
                        lastName: { type: "string", minLength: 2, maxLength: 50, example: "Pérez" },
                        email: { type: "string", format: "email", example: "ana.perez@digiflai.com" },
                        password: { type: "string", minLength: 6, example: "digiflai123" },
                        phone: { type: "string", nullable: true, example: "+57 300 000 0000" },
                        roleId: {
                            type: "integer",
                            description: "1 = ADMIN, 2 = OPERATOR, 3 = TECHNICIAN, 4 = RESEARCHER",
                            example: 2
                        }
                    }
                },

                UserSummary: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        firstName: { type: "string", example: "Dany" },
                        lastName: { type: "string", example: "Tobon" },
                        email: { type: "string", format: "email", example: "admin@digiflai.com" },
                        role: { type: "string", example: "ADMIN" }
                    }
                },

                LoginResponse: {
                    type: "object",
                    properties: {
                        token: {
                            type: "string",
                            description: "JWT que debe enviarse como Bearer token.",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        },
                        user: { $ref: "#/components/schemas/UserSummary" }
                    }
                },

                /* ---------------- Usuarios ---------------- */

                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        firstName: { type: "string", example: "Dany" },
                        lastName: { type: "string", example: "Tobon" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string", nullable: true },
                        status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] },
                        roleId: { type: "integer", example: 1 },
                        role: {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 1 },
                                name: { type: "string", example: "ADMIN" },
                                description: { type: "string" }
                            }
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },

                CreateUserRequest: {
                    type: "object",
                    required: ["firstName", "lastName", "email", "password", "roleId"],
                    properties: {
                        firstName: { type: "string", minLength: 3, maxLength: 50, example: "Carlos" },
                        lastName: { type: "string", minLength: 3, maxLength: 50, example: "Gómez" },
                        email: { type: "string", format: "email", example: "carlos.gomez@digiflai.com" },
                        password: { type: "string", minLength: 8, example: "digiflai123" },
                        phone: { type: "string", nullable: true, example: "+57 300 111 2233" },
                        roleId: { type: "integer", example: 2 }
                    }
                },

                UpdateUserRequest: {
                    type: "object",
                    properties: {
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 8 },
                        phone: { type: "string" },
                        roleId: { type: "integer" },
                        status: { type: "string", enum: ["ACTIVE", "INACTIVE", "BLOCKED"] }
                    }
                },

                UserListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "object",
                            properties: {
                                total: { type: "integer", example: 5 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 10 },
                                users: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/User" }
                                }
                            }
                        }
                    }
                },

                /* ---------------- Drones ---------------- */

                Drone: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 3 },
                        code: { type: "string", example: "SD-0002" },
                        serial: { type: "string", example: "SN-0000002" },
                        model: { type: "string", example: "Matrice 300 RTK" },
                        manufacturer: { type: "string", example: "DJI" },
                        battery: { type: "integer", minimum: 0, maximum: 100, example: 61 },
                        firmware: { type: "string", nullable: true },
                        status: {
                            type: "string",
                            enum: ["AVAILABLE", "IN_MISSION", "MAINTENANCE", "OFFLINE"]
                        },
                        userId: { type: "integer", nullable: true, example: 3 },
                        operator: {
                            type: "object",
                            nullable: true,
                            properties: {
                                id: { type: "integer" },
                                firstName: { type: "string", example: "C." },
                                lastName: { type: "string", example: "Pinilla" },
                                email: { type: "string", format: "email" }
                            }
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },

                CreateDroneRequest: {
                    type: "object",
                    required: ["code", "serial", "manufacturer", "model", "battery"],
                    properties: {
                        code: { type: "string", example: "SD-0007" },
                        serial: { type: "string", example: "SN-0000007" },
                        manufacturer: { type: "string", example: "DJI" },
                        model: { type: "string", example: "Matrice 4T" },
                        firmware: { type: "string", nullable: true, example: "1.0.0" },
                        battery: { type: "integer", minimum: 0, maximum: 100, example: 100 },
                        status: {
                            type: "string",
                            enum: ["AVAILABLE", "IN_MISSION", "MAINTENANCE", "OFFLINE"],
                            example: "AVAILABLE"
                        },
                        userId: { type: "integer", nullable: true, example: 2 }
                    }
                },

                UpdateDroneRequest: {
                    type: "object",
                    properties: {
                        manufacturer: { type: "string" },
                        model: { type: "string" },
                        firmware: { type: "string" },
                        battery: { type: "integer", minimum: 0, maximum: 100 },
                        status: {
                            type: "string",
                            enum: ["AVAILABLE", "IN_MISSION", "MAINTENANCE", "OFFLINE"]
                        },
                        userId: { type: "integer", nullable: true }
                    }
                },

                DroneListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Drone" }
                        }
                    }
                },

                /* ---------------- Misiones ---------------- */

                Mission: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Inspección línea 220kV" },
                        description: { type: "string", nullable: true },
                        location: { type: "string", example: "Bogotá, Colombia" },
                        latitude: { type: "number", example: 4.711 },
                        longitude: { type: "number", example: -74.0721 },
                        altitude: { type: "number", example: 120 },
                        status: {
                            type: "string",
                            enum: ["PENDING", "RUNNING", "COMPLETED", "CANCELLED"]
                        },
                        droneId: { type: "integer", example: 3 },
                        drone: { $ref: "#/components/schemas/Drone" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },

                CreateMissionRequest: {
                    type: "object",
                    required: ["name", "location", "latitude", "longitude", "altitude", "droneId"],
                    properties: {
                        name: { type: "string", example: "Inspección de torre norte" },
                        description: { type: "string", example: "Revisión visual y térmica" },
                        location: { type: "string", example: "Bogotá, Colombia" },
                        latitude: { type: "number", example: 4.711 },
                        longitude: { type: "number", example: -74.0721 },
                        altitude: { type: "number", example: 120 },
                        status: {
                            type: "string",
                            enum: ["PENDING", "RUNNING", "COMPLETED", "CANCELLED"],
                            example: "PENDING"
                        },
                        droneId: {
                            type: "integer",
                            description: "Id de un dron en estado AVAILABLE.",
                            example: 2
                        }
                    }
                },

                MissionListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Mission" }
                        }
                    }
                },

                /* ---------------- Alertas ---------------- */

                Alert: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        title: { type: "string", example: "Riesgo de fallo" },
                        description: { type: "string", example: "Motor delantero izquierdo" },
                        level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                        attended: { type: "boolean", example: false },
                        droneId: { type: "integer", example: 3 },
                        drone: { $ref: "#/components/schemas/Drone" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },

                AlertListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Alert" }
                        }
                    }
                },

                /* ---------------- Telemetría ---------------- */

                Telemetry: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "675f1a2b9c3e4d5f6a7b8c9d" },
                        droneId: { type: "integer", example: 3 },
                        latitude: { type: "number", example: 4.711 },
                        longitude: { type: "number", example: -74.0721 },
                        altitude: { type: "number", example: 120 },
                        speed: { type: "number", example: 45 },
                        battery: { type: "integer", minimum: 0, maximum: 100, example: 55 },
                        temperature: { type: "number", example: 37 },
                        humidity: { type: "number", example: 60 },
                        signalStrength: { type: "integer", example: 85 },
                        heading: { type: "number", example: 180 },
                        vibration: { type: "number", example: 2.1 },
                        status: { type: "string", example: "ONLINE" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },

                CreateTelemetryRequest: {
                    type: "object",
                    required: ["droneId", "latitude", "longitude"],
                    properties: {
                        droneId: { type: "integer", example: 3 },
                        latitude: { type: "number", example: 4.711 },
                        longitude: { type: "number", example: -74.0721 },
                        altitude: { type: "number", example: 120 },
                        speed: { type: "number", example: 45 },
                        battery: { type: "integer", minimum: 0, maximum: 100, example: 55 },
                        temperature: { type: "number", example: 37 },
                        humidity: { type: "number", example: 60 },
                        signalStrength: { type: "integer", example: 85 },
                        heading: { type: "number", example: 180 },
                        vibration: { type: "number", example: 2.1 },
                        status: { type: "string", example: "ONLINE" }
                    }
                },

                TelemetryListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Telemetry" }
                        }
                    }
                },

                /* ---------------- Mantenimiento ---------------- */

                Maintenance: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        description: { type: "string", example: "Cambio de motor" },
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time", nullable: true },
                        droneId: { type: "integer", example: 4 },
                        technicianId: { type: "integer", example: 4 },
                        drone: { $ref: "#/components/schemas/Drone" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },

                CreateMaintenanceRequest: {
                    type: "object",
                    required: ["description", "startDate", "droneId", "technicianId"],
                    properties: {
                        description: { type: "string", example: "Cambio de motor trasero derecho" },
                        startDate: { type: "string", format: "date-time", example: "2026-11-13T08:00:00.000Z" },
                        endDate: { type: "string", format: "date-time", nullable: true },
                        droneId: { type: "integer", example: 4 },
                        technicianId: { type: "integer", example: 4 }
                    }
                },

                MaintenanceListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Maintenance" }
                        }
                    }
                },

                /* ---------------- Predicciones ---------------- */

                Prediction: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        component: { type: "string", example: "Motor delantero izq." },
                        probability: { type: "integer", minimum: 0, maximum: 100, example: 94 },
                        risk: { type: "string", enum: ["BAJO", "MEDIO", "ALTO", "CRITICO"] },
                        model: { type: "string", example: "LSTM v2.1" },
                        recommendation: { type: "string", example: "Reemplazar rodamiento." },
                        droneId: { type: "integer", example: 3 },
                        drone: { $ref: "#/components/schemas/Drone" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                },

                PredictionListResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Prediction" }
                        }
                    }
                },

                /* ---------------- Dashboard ---------------- */

                DashboardResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "object",
                            properties: {
                                indicators: {
                                    type: "object",
                                    properties: {
                                        totalDrones: { type: "integer", example: 6 },
                                        available: { type: "integer", example: 2 },
                                        inMission: { type: "integer", example: 2 },
                                        maintenance: { type: "integer", example: 1 },
                                        offline: { type: "integer", example: 1 },
                                        totalUsers: { type: "integer", example: 5 },
                                        activeMissions: { type: "integer", example: 2 },
                                        totalAlerts: { type: "integer", example: 4 },
                                        criticalAlerts: { type: "integer", example: 1 },
                                        averageBattery: { type: "number", example: 50.33 }
                                    }
                                },
                                telemetry: {
                                    type: "array",
                                    description: "Última lectura de cada dron.",
                                    items: {
                                        type: "object",
                                        properties: {
                                            _id: { type: "integer", description: "Id del dron" },
                                            battery: { type: "integer" },
                                            speed: { type: "number" },
                                            altitude: { type: "number" },
                                            latitude: { type: "number" },
                                            longitude: { type: "number" },
                                            signal: { type: "integer" },
                                            updatedAt: { type: "string", format: "date-time" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },

                /* ---------------- Demostración ---------------- */

                DemoResetResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        data: {
                            type: "object",
                            properties: {
                                deletedMissions: { type: "integer", example: 1 },
                                deletedMaintenances: { type: "integer", example: 1 },
                                restoredDrones: { type: "integer", example: 6 }
                            }
                        }
                    }
                },

                /* ---------------- Comunes ---------------- */

                MessageResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string", example: "Operación realizada correctamente." }
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
                },

                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "No tiene permisos para esta acción" }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: "Auth", description: "Inicio de sesión y registro" },
            { name: "Users", description: "Usuarios (solo ADMIN)" },
            { name: "Drones", description: "Flota de drones" },
            { name: "Telemetry", description: "Telemetría en tiempo real (MongoDB)" },
            { name: "Missions", description: "Misiones de vuelo" },
            { name: "Alerts", description: "Alertas de los drones" },
            { name: "Dashboard", description: "Indicadores del panel general" },
            { name: "Maintenance", description: "Registro de mantenimientos" },
            { name: "Predictions", description: "Predicciones de fallo (IA)" },
            { name: "Reports", description: "Reportes PDF / Excel" },
            { name: "Demo", description: "Reinicio de la demostración para el stand" }
        ]
    },
    apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
