/* ------------------------------------------------------------------
   Documentación OpenAPI de los endpoints de DigiflAi.

   Se mantiene aparte de swagger.js para que la configuración general
   (info, servidores, esquemas) no se mezcle con las rutas.

   Cada `path` corresponde a una ruta real montada en src/app.js.
------------------------------------------------------------------ */

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const jsonResponse = (description, schema) => ({
    description,
    content: {
        "application/json": { schema }
    }
});

const errorResponse = (description) => jsonResponse(description, ref("Error"));

const commonErrors = {
    401: errorResponse("No autenticado: falta el token o la firma no es válida."),
    500: errorResponse("Error del servidor.")
};

const idParam = (name, description) => ({
    name,
    in: "path",
    required: true,
    description,
    schema: { type: "integer" },
    example: 3
});

const pageParams = [
    {
        name: "page",
        in: "query",
        required: false,
        description: "Número de página (desde 1).",
        schema: { type: "integer", minimum: 1, default: 1 }
    },
    {
        name: "limit",
        in: "query",
        required: false,
        description: "Cantidad de registros por página.",
        schema: { type: "integer", minimum: 1, default: 10 }
    }
];

const paths = {

    /* ------------------------------------------------------------
       AUTENTICACIÓN
    ------------------------------------------------------------ */

    "/api/auth/login": {
        post: {
            tags: ["Auth"],
            summary: "Iniciar sesión y obtener un token JWT",
            description:
                "Devuelve un token que debe enviarse en el header " +
                "`Authorization: Bearer <token>` en todas las demás rutas. " +
                "**Este endpoint no requiere token.** Copie el valor de " +
                "`token` y péguelo en el botón *Authorize*.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("LoginRequest"),
                        example: {
                            email: "admin@digiflai.com",
                            password: "digiflai123"
                        }
                    }
                }
            },
            responses: {
                200: jsonResponse("Sesión iniciada.", ref("LoginResponse")),
                400: errorResponse("Faltan campos o el correo no es válido."),
                401: errorResponse("Credenciales inválidas."),
                429: errorResponse("Demasiados intentos de inicio de sesión.")
            }
        }
    },

    "/api/auth/register": {
        post: {
            tags: ["Auth"],
            summary: "Registrar un usuario",
            description:
                "Crea un usuario y devuelve un token. `roleId`: 1 = ADMIN, " +
                "2 = OPERATOR, 3 = TECHNICIAN, 4 = RESEARCHER. " +
                "**Este endpoint no requiere token.**",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("RegisterRequest"),
                        example: {
                            firstName: "Ana",
                            lastName: "Pérez",
                            email: "ana.perez@digiflai.com",
                            password: "digiflai123",
                            phone: "+57 300 000 0000",
                            roleId: 2
                        }
                    }
                }
            },
            responses: {
                201: jsonResponse("Usuario registrado.", ref("LoginResponse")),
                400: errorResponse("Datos inválidos o correo ya registrado."),
                500: errorResponse("Error del servidor.")
            }
        }
    },

    /* ------------------------------------------------------------
       USUARIOS (solo ADMIN)
    ------------------------------------------------------------ */

    "/api/users": {
        get: {
            tags: ["Users"],
            summary: "Listar usuarios",
            description: "Requiere rol **ADMIN**. La contraseña nunca se devuelve.",
            parameters: [
                ...pageParams,
                {
                    name: "search",
                    in: "query",
                    required: false,
                    description: "Busca por nombre, apellido o correo.",
                    schema: { type: "string" },
                    example: "moreno"
                }
            ],
            responses: {
                200: jsonResponse("Lista paginada de usuarios.", ref("UserListResponse")),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN."),
                500: commonErrors[500]
            }
        },
        post: {
            tags: ["Users"],
            summary: "Crear un usuario",
            description: "Requiere rol **ADMIN**.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("CreateUserRequest"),
                        example: {
                            firstName: "Carlos",
                            lastName: "Gómez",
                            email: "carlos.gomez@digiflai.com",
                            password: "digiflai123",
                            phone: "+57 300 111 2233",
                            roleId: 2
                        }
                    }
                }
            },
            responses: {
                201: jsonResponse("Usuario creado.", ref("User")),
                400: errorResponse("Datos inválidos."),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN."),
                500: commonErrors[500]
            }
        }
    },

    "/api/users/{id}": {
        get: {
            tags: ["Users"],
            summary: "Consultar un usuario por id",
            description: "Requiere rol **ADMIN**.",
            parameters: [idParam("id", "Id del usuario.")],
            responses: {
                200: jsonResponse("Usuario encontrado.", ref("User")),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN."),
                500: errorResponse("El usuario no existe.")
            }
        },
        put: {
            tags: ["Users"],
            summary: "Actualizar un usuario",
            description:
                "Requiere rol **ADMIN**. Todos los campos son opcionales. " +
                "Si se envía `password`, se guarda encriptada.",
            parameters: [idParam("id", "Id del usuario.")],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("UpdateUserRequest"),
                        example: { phone: "+57 300 999 8877", status: "ACTIVE" }
                    }
                }
            },
            responses: {
                200: jsonResponse("Usuario actualizado.", ref("User")),
                400: errorResponse("Datos inválidos."),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN."),
                500: errorResponse("El usuario no existe.")
            }
        },
        delete: {
            tags: ["Users"],
            summary: "Eliminar un usuario (borrado lógico)",
            description:
                "Requiere rol **ADMIN**. Marca `deletedAt` y cambia el estado " +
                "a `INACTIVE`; no borra la fila.",
            parameters: [idParam("id", "Id del usuario.")],
            responses: {
                200: jsonResponse("Usuario eliminado logicamente.", ref("MessageResponse")),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN."),
                500: errorResponse("El usuario no existe.")
            }
        }
    },

    /* ------------------------------------------------------------
       DRONES
    ------------------------------------------------------------ */

    "/api/drones": {
        get: {
            tags: ["Drones"],
            summary: "Listar drones",
            description:
                "Devuelve un arreglo con los drones y su operador. " +
                "La API pagina por defecto a 10 resultados; use `limit` para ver más.",
            parameters: [
                {
                    name: "status",
                    in: "query",
                    required: false,
                    description: "Filtra por estado.",
                    schema: {
                        type: "string",
                        enum: ["AVAILABLE", "IN_MISSION", "MAINTENANCE", "OFFLINE"]
                    },
                    example: "AVAILABLE"
                },
                {
                    name: "userId",
                    in: "query",
                    required: false,
                    description: "Filtra por operador asignado.",
                    schema: { type: "integer" },
                    example: 2
                },
                ...pageParams
            ],
            responses: {
                200: jsonResponse("Lista de drones.", ref("DroneListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        },
        post: {
            tags: ["Drones"],
            summary: "Registrar un dron",
            description: "Requiere rol **ADMIN** o SUPERVISOR.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("CreateDroneRequest"),
                        example: {
                            code: "SD-0007",
                            serial: "SN-0000007",
                            manufacturer: "DJI",
                            model: "Matrice 4T",
                            firmware: "1.0.0",
                            battery: 100,
                            status: "AVAILABLE",
                            userId: 2
                        }
                    }
                }
            },
            responses: {
                201: jsonResponse("Dron registrado.", ref("Drone")),
                400: errorResponse("Datos inválidos o código/serial duplicado."),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN o SUPERVISOR."),
                500: commonErrors[500]
            }
        }
    },

    "/api/drones/{id}": {
        get: {
            tags: ["Drones"],
            summary: "Consultar un dron por id",
            parameters: [idParam("id", "Id del dron.")],
            responses: {
                200: jsonResponse("Dron encontrado.", ref("Drone")),
                401: commonErrors[401],
                500: errorResponse("El dron no existe.")
            }
        },
        put: {
            tags: ["Drones"],
            summary: "Actualizar un dron",
            description: "Requiere rol **ADMIN** o SUPERVISOR.",
            parameters: [idParam("id", "Id del dron.")],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("UpdateDroneRequest"),
                        example: { battery: 75, status: "MAINTENANCE" }
                    }
                }
            },
            responses: {
                200: jsonResponse("Dron actualizado.", ref("Drone")),
                400: errorResponse("Datos inválidos."),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN o SUPERVISOR."),
                500: commonErrors[500]
            }
        },
        delete: {
            tags: ["Drones"],
            summary: "Eliminar un dron",
            description: "Requiere rol **ADMIN**.",
            parameters: [idParam("id", "Id del dron.")],
            responses: {
                200: jsonResponse("Dron eliminado.", ref("MessageResponse")),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN."),
                500: commonErrors[500]
            }
        }
    },

    /* ------------------------------------------------------------
       TELEMETRÍA (MongoDB)
    ------------------------------------------------------------ */

    "/api/telemetry": {
        get: {
            tags: ["Telemetry"],
            summary: "Listar lecturas de telemetría",
            description:
                "Devuelve las lecturas almacenadas en MongoDB, de la más reciente " +
                "a la más antigua.",
            parameters: pageParams,
            responses: {
                200: jsonResponse("Lecturas de telemetría.", ref("TelemetryListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        },
        post: {
            tags: ["Telemetry"],
            summary: "Insertar una lectura de telemetría",
            description:
                "Las lecturas también llegan por MQTT al tema " +
                "`digiflai/telemetry/#`. Si la batería baja de 20 %, la " +
                "temperatura supera 80 °C o la señal baja de 30 %, el backend " +
                "genera alertas automáticamente.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("CreateTelemetryRequest"),
                        example: {
                            droneId: 3,
                            latitude: 4.711,
                            longitude: -74.0721,
                            altitude: 120,
                            speed: 45,
                            battery: 55,
                            temperature: 37,
                            humidity: 60,
                            signalStrength: 85,
                            heading: 180,
                            vibration: 2.1,
                            status: "ONLINE"
                        }
                    }
                }
            },
            responses: {
                201: jsonResponse("Lectura almacenada.", ref("Telemetry")),
                400: errorResponse("Datos inválidos."),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    "/api/telemetry/drone/{droneId}": {
        get: {
            tags: ["Telemetry"],
            summary: "Historial de telemetría de un dron",
            description: "Lecturas de un dron, de la más reciente a la más antigua.",
            parameters: [
                idParam("droneId", "Id numérico del dron (no el código)."),
                ...pageParams
            ],
            responses: {
                200: jsonResponse("Lecturas del dron.", ref("TelemetryListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    /* ------------------------------------------------------------
       MISIONES
    ------------------------------------------------------------ */

    "/api/missions": {
        get: {
            tags: ["Missions"],
            summary: "Listar misiones",
            description:
                "Devuelve las misiones con su dron, de la más reciente a la más " +
                "antigua. El endpoint no acepta paginación: entrega hasta 10.",
            responses: {
                200: jsonResponse("Lista de misiones.", ref("MissionListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        },
        post: {
            tags: ["Missions"],
            summary: "Crear una misión",
            description:
                "El dron debe existir y estar en estado `AVAILABLE`. Al crearla, " +
                "el dron pasa a `IN_MISSION`.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("CreateMissionRequest"),
                        example: {
                            name: "Inspección de torre norte",
                            description: "Revisión visual y térmica",
                            location: "Bogotá, Colombia",
                            latitude: 4.711,
                            longitude: -74.0721,
                            altitude: 120,
                            status: "PENDING",
                            droneId: 2
                        }
                    }
                }
            },
            responses: {
                201: jsonResponse("Misión creada.", ref("Mission")),
                400: errorResponse("Datos inválidos o dron no disponible."),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    "/api/missions/{id}/finish": {
        put: {
            tags: ["Missions"],
            summary: "Finalizar una misión",
            description:
                "Marca la misión como `COMPLETED` y devuelve el dron a `AVAILABLE`.",
            parameters: [idParam("id", "Id de la misión.")],
            responses: {
                200: jsonResponse("Misión finalizada.", ref("MessageResponse")),
                401: commonErrors[401],
                500: errorResponse("La misión no existe.")
            }
        }
    },

    /* ------------------------------------------------------------
       ALERTAS
    ------------------------------------------------------------ */

    "/api/alerts": {
        get: {
            tags: ["Alerts"],
            summary: "Listar alertas",
            parameters: [
                {
                    name: "level",
                    in: "query",
                    required: false,
                    description: "Filtra por nivel.",
                    schema: {
                        type: "string",
                        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
                    },
                    example: "CRITICAL"
                },
                {
                    name: "attended",
                    in: "query",
                    required: false,
                    description: "Filtra por atendidas (`true`) o pendientes (`false`).",
                    schema: { type: "string", enum: ["true", "false"] },
                    example: "false"
                }
            ],
            responses: {
                200: jsonResponse("Lista de alertas.", ref("AlertListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    "/api/alerts/{id}/attend": {
        put: {
            tags: ["Alerts"],
            summary: "Marcar una alerta como atendida",
            description:
                "Cambia `attended` a `true`. El indicador `criticalAlerts` del " +
                "dashboard solo cuenta alertas críticas no atendidas.",
            parameters: [idParam("id", "Id de la alerta.")],
            responses: {
                200: jsonResponse("Alerta atendida.", ref("Alert")),
                401: commonErrors[401],
                500: errorResponse("La alerta no existe.")
            }
        }
    },

    "/api/alerts/{id}": {
        delete: {
            tags: ["Alerts"],
            summary: "Eliminar una alerta",
            parameters: [idParam("id", "Id de la alerta.")],
            responses: {
                200: jsonResponse("Alerta eliminada.", ref("MessageResponse")),
                401: commonErrors[401],
                500: errorResponse("La alerta no existe.")
            }
        }
    },

    /* ------------------------------------------------------------
       DASHBOARD
    ------------------------------------------------------------ */

    "/api/dashboard": {
        get: {
            tags: ["Dashboard"],
            summary: "Indicadores y última telemetría",
            description:
                "Devuelve los indicadores que usa el Panel general y la última " +
                "lectura de telemetría de cada dron.",
            responses: {
                200: jsonResponse("Indicadores del panel.", ref("DashboardResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    /* ------------------------------------------------------------
       MANTENIMIENTO
    ------------------------------------------------------------ */

    "/api/maintenance": {
        get: {
            tags: ["Maintenance"],
            summary: "Listar mantenimientos",
            description:
                "Devuelve los mantenimientos con su dron y su técnico, del más " +
                "reciente al más antiguo.",
            parameters: pageParams,
            responses: {
                200: jsonResponse("Lista de mantenimientos.", ref("MaintenanceListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        },
        post: {
            tags: ["Maintenance"],
            summary: "Registrar un mantenimiento",
            description:
                "Crea el registro y pone el dron en estado `MAINTENANCE`. " +
                "`technicianId` debe ser el id de un usuario existente.",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: ref("CreateMaintenanceRequest"),
                        example: {
                            description: "Cambio de motor trasero derecho",
                            startDate: "2026-11-13T08:00:00.000Z",
                            droneId: 4,
                            technicianId: 4
                        }
                    }
                }
            },
            responses: {
                201: jsonResponse("Mantenimiento registrado.", ref("Maintenance")),
                400: errorResponse("Datos inválidos."),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    "/api/maintenance/{id}/finish": {
        put: {
            tags: ["Maintenance"],
            summary: "Finalizar un mantenimiento",
            description:
                "Registra la fecha de fin y devuelve el dron a `AVAILABLE`.",
            parameters: [idParam("id", "Id del mantenimiento.")],
            responses: {
                200: jsonResponse("Mantenimiento finalizado.", ref("Maintenance")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    "/api/maintenance/history/{droneId}": {
        get: {
            tags: ["Maintenance"],
            summary: "Historial de mantenimiento de un dron",
            parameters: [idParam("droneId", "Id numérico del dron.")],
            responses: {
                200: jsonResponse("Historial del dron.", ref("MaintenanceListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    /* ------------------------------------------------------------
       PREDICCIONES (IA)
    ------------------------------------------------------------ */

    "/api/predictions": {
        get: {
            tags: ["Predictions"],
            summary: "Listar predicciones de fallo",
            description:
                "Devuelve las predicciones ordenadas por probabilidad descendente.",
            parameters: [
                {
                    name: "droneId",
                    in: "query",
                    required: false,
                    description: "Filtra por dron.",
                    schema: { type: "integer" },
                    example: 3
                },
                {
                    name: "risk",
                    in: "query",
                    required: false,
                    description: "Filtra por nivel de riesgo.",
                    schema: {
                        type: "string",
                        enum: ["BAJO", "MEDIO", "ALTO", "CRITICO"]
                    },
                    example: "CRITICO"
                }
            ],
            responses: {
                200: jsonResponse("Lista de predicciones.", ref("PredictionListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    "/api/predictions/drone/{droneId}": {
        get: {
            tags: ["Predictions"],
            summary: "Predicciones de un dron",
            parameters: [idParam("droneId", "Id numérico del dron.")],
            responses: {
                200: jsonResponse("Predicciones del dron.", ref("PredictionListResponse")),
                401: commonErrors[401],
                500: commonErrors[500]
            }
        }
    },

    /* ------------------------------------------------------------
       REPORTES (solo ADMIN / SUPERVISOR)
    ------------------------------------------------------------ */

    "/api/reports/missions/pdf": {
        get: {
            tags: ["Reports"],
            summary: "Reporte de misiones en PDF",
            description: "Requiere rol **ADMIN** o SUPERVISOR. Descarga el archivo.",
            responses: {
                200: {
                    description: "Archivo PDF.",
                    content: {
                        "application/pdf": { schema: { type: "string", format: "binary" } }
                    }
                },
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN o SUPERVISOR."),
                500: commonErrors[500]
            }
        }
    },

    "/api/reports/drones/excel": {
        get: {
            tags: ["Reports"],
            summary: "Reporte de drones en Excel",
            description: "Requiere rol **ADMIN** o SUPERVISOR. Descarga el archivo.",
            responses: {
                200: {
                    description: "Archivo XLSX.",
                    content: {
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                            schema: { type: "string", format: "binary" }
                        }
                    }
                },
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN o SUPERVISOR."),
                500: commonErrors[500]
            }
        }
    },

    /* ------------------------------------------------------------
       DEMOSTRACIÓN (solo ADMIN / SUPERVISOR)
    ------------------------------------------------------------ */

    "/api/demo/reset": {
        post: {
            tags: ["Demo"],
            summary: "Reiniciar la demostración",
            description:
                "Borra las misiones y los mantenimientos creados desde la " +
                "pestaña **Operaciones** (los que empiezan por `[DEMO]`) y " +
                "devuelve los drones y las misiones sembradas a su estado " +
                "inicial. Requiere rol **ADMIN** o SUPERVISOR. Es idempotente: " +
                "se puede llamar varias veces sin efecto adicional.",
            responses: {
                200: jsonResponse("Demostración reiniciada.", ref("DemoResetResponse")),
                401: commonErrors[401],
                403: errorResponse("Requiere rol ADMIN o SUPERVISOR."),
                500: commonErrors[500]
            }
        }
    }

};

module.exports = paths;
