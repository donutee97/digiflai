# DigiflAi

Plataforma de gestión de flotas de UAV (drones) con telemetría en tiempo real, alertas, mantenimiento predictivo y gemelo digital.

Monorepo con dos aplicaciones independientes:

- **`backend/`** — API REST + WebSockets + consumidor MQTT.
- **`frontend/`** — panel de control en React.

---

## Tabla de contenido

1. [Características](#características)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Requisitos](#requisitos)
5. [Instalación](#instalación)
6. [Variables de entorno](#variables-de-entorno)
7. [Bases de datos](#bases-de-datos)
8. [Scripts disponibles](#scripts-disponibles)
9. [API](#api)
10. [Dependencias](#dependencias)
11. [Solución de problemas](#solución-de-problemas)

---

## Características

- Autenticación con JWT y control de acceso por roles.
- Gestión de usuarios, drones, misiones, alertas y mantenimiento.
- Telemetría en tiempo real vía MQTT → MongoDB → Socket.IO.
- Predicción de fallos y alertas automáticas.
- Reportes en Excel y PDF.
- Documentación interactiva con Swagger.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20+ |
| API | Express 4 |
| ORM PostgreSQL | Prisma 7 |
| BD relacional | PostgreSQL 16 |
| ODM MongoDB | Mongoose 8 |
| BD de telemetría | MongoDB 7 |
| Mensajería | MQTT (EMQX 5.7) |
| Tiempo real | Socket.IO 4 |
| Autenticación | JSON Web Tokens + bcrypt |
| Validación | Joi |
| Documentación | Swagger / OpenAPI 3 |
| Logs | Winston + Morgan |
| Frontend | React 19 + Vite 8 |
| Estilos | Tailwind CSS 4 |
| Gráficas | Recharts 3 |
| Contenedores | Docker / Podman |

---

## Arquitectura

```
digiflai/
├── backend/                        # API
│   ├── prisma/
│   │   ├── schema.prisma           # modelos PostgreSQL
│   │   ├── migrations/             # migraciones SQL
│   │   ├── seed.js                 # roles iniciales
│   │   └── seed-demo.js            # datos de demostración
│   ├── src/
│   │   ├── config/                 # prisma, mongo, swagger
│   │   ├── controllers/            # capa HTTP
│   │   ├── middleware/             # auth, roles, validación, errores
│   │   ├── models/                 # modelo Mongoose (telemetría)
│   │   ├── mqtt/                   # consumidor MQTT
│   │   ├── repositories/           # acceso a datos
│   │   ├── routes/                 # endpoints
│   │   ├── services/               # lógica de negocio
│   │   ├── sockets/                # Socket.IO
│   │   ├── utils/                  # jwt, logger
│   │   ├── validators/             # esquemas Joi
│   │   ├── app.js                  # app Express
│   │   └── server.js               # arranque HTTP + WS + MQTT
│   ├── tests/                      # Jest + Supertest
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── prisma.config.ts
│   ├── .env.example
│   └── package.json
├── frontend/                       # panel React
│   ├── src/
│   │   ├── api/                    # cliente HTTP y mapeadores
│   │   ├── assets/
│   │   ├── components/             # ui, charts, layout
│   │   ├── data/mock.js            # datos de ejemplo (pestañas sin API aún)
│   │   ├── hooks/                  # useApiData
│   │   ├── views/                  # pestañas del panel
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── nginx.conf                  # servidor de producción
│   ├── Dockerfile                  # build + Nginx
│   ├── .oxlintrc.json
│   └── package.json
├── docker-compose.yml              # PostgreSQL + MongoDB + EMQX + API + Frontend
├── .env.example                    # variables del compose
├── package.json                    # scripts raíz
├── .gitignore
└── README.md
```

**Flujo de datos**

```
Dron ──MQTT──► EMQX ──► backend ──► MongoDB (telemetría)
                          │
                          ├──► PostgreSQL (datos de negocio)
                          └──► Socket.IO ──► Frontend
```

---

## Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 |
| npm | 10 |
| Docker + Docker Compose | 24 / v2 |
| Git | cualquiera reciente |

> En Fedora/RHEL puedes usar **Podman** en lugar de Docker:
> `sudo dnf install podman podman-compose` y reemplaza `docker compose` por `podman-compose`.

---

## Instalación

### 1. Clonar

```bash
git clone <URL_DEL_REPOSITORIO>
cd digiflai
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # luego edita JWT_SECRET
npm install
```

### 3. Levantar la infraestructura

Desde la raíz del proyecto:

```bash
docker compose up -d postgres mongodb mqtt
```

Verificar:

```bash
docker compose ps
```

### 4. Crear el esquema y los datos iniciales

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run seed:demo   # opcional: datos de ejemplo para ver el frontend con información
```

`seed` crea los roles del sistema; `seed:demo` carga el conjunto de datos de
demostración (5 usuarios, 6 drones, misiones, alertas, mantenimientos,
predicciones y telemetría en MongoDB). Todos los usuarios demo usan la
contraseña `digiflai123`; el administrador es `admin@digiflai.com`.

### 5. Arrancar la API

```bash
npm start
```

| Recurso | URL |
|---|---|
| API | http://localhost:4000 |
| Salud | http://localhost:4000/health |
| Swagger | http://localhost:4000/api-docs |

### 6. Frontend

```bash
cd frontend
npm install
npm run dev
```

Panel: http://localhost:5173

---

## Ejecución con Docker (todo el stack)

Si prefieres no instalar Node, puedes levantar **todo** con contenedores:

```bash
cp .env.example .env        # opcional: ajusta puertos y JWT
docker compose up -d --build
```

| Servicio | Contenedor | URL |
|---|---|---|
| Frontend (Nginx) | `frontend` | http://localhost:5173 |
| API | `api` | http://localhost:4000 |
| Swagger | `api` | http://localhost:4000/api-docs |
| PostgreSQL | `postgres` | `localhost:5433` |
| MongoDB | `mongodb` | `localhost:27017` |
| EMQX | `mqtt` | `localhost:1883` (panel `18083`) |

> El frontend se compila dentro de la imagen: las variables `VITE_*` se
> **incrustan en el bundle al hacer build**. Si las cambias, hay que reconstruir:
> `docker compose build frontend`.

Si usas un PostgreSQL local (sin contenedor), levanta solo el resto:

```bash
# 1. MongoDB + EMQX
docker compose up -d mongodb mqtt

# 2. Backend con Postgres local
cd backend && npm start

# 3. Frontend (en otra terminal)
cd frontend && npm run dev
```

O el frontend servido por Nginx (sin depender del contenedor `api`):

```bash
docker compose up -d --build --no-deps frontend
```

> `--no-deps` evita que se levanten `api` y `postgres`. El bundle del front
> apunta a `http://localhost:4000`, donde corre tu backend local.

Para detener todo:

```bash
docker compose down          # conserva datos
docker compose down -v       # borra volúmenes (¡borra las BD!)
```

---

## Variables de entorno

El backend requiere `backend/.env` (no se versiona). Plantilla: `backend/.env.example`.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto de la API | `4000` |
| `NODE_ENV` | Entorno | `development` |
| `FRONTEND_URL` | Origen permitido por CORS/WebSocket | `http://localhost:5173` |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://postgres:admin_db1@localhost:5433/digiflai?schema=public` |
| `MONGO_URL` | Conexión MongoDB | `mongodb://localhost:27017/digiflai_telemetry` |
| `JWT_SECRET` | Clave de firma JWT | obligatoria |
| `JWT_EXPIRES_IN` | Duración del token | `8h` |
| `MQTT_BROKER` | Broker MQTT | `mqtt://localhost:1883` |
| `LOG_LEVEL` | Nivel de logs | `info` |

Generar una clave JWT segura:

```bash
openssl rand -hex 32
```

El frontend puede configurarse con `frontend/.env`:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API |
| `VITE_SOCKET_URL` | URL del servidor Socket.IO |
| `VITE_DEMO_EMAIL` | Usuario del login automático temporal (por defecto `admin@digiflai.com`) |
| `VITE_DEMO_PASSWORD` | Contraseña del login automático temporal (por defecto `digiflai123`) |

---

## Bases de datos

El proyecto usa **dos motores** con propósitos distintos:

| Motor | Datos | Definición |
|---|---|---|
| PostgreSQL | usuarios, roles, drones, misiones, alertas, mantenimiento | `backend/prisma/schema.prisma` |
| MongoDB | telemetría (lat/long, batería, temperatura, señal...) | `backend/src/models/telemetry.model.js` |

**PostgreSQL**

- El contenedor publica el puerto **5433** para evitar conflictos con un PostgreSQL local. Se puede cambiar con `POSTGRES_PORT`.
- La base `digiflai` se crea automáticamente.
- Las tablas se crean con `npx prisma migrate deploy`.

**MongoDB**

- Base `digiflai_telemetry`.
- La colección se crea automáticamente con la primera lectura de telemetría.

**MQTT**

- Topic de telemetría: `digiflai/telemetry/#`.
- Panel EMQX: http://localhost:18083 (`admin` / `public`).

**Acceso rápido**

```bash
# PostgreSQL
psql "postgresql://postgres:admin_db1@localhost:5433/digiflai"

# MongoDB
docker compose exec mongodb mongosh

# GUI de PostgreSQL
cd backend && npx prisma studio     # http://localhost:5555
```

---

## Scripts disponibles

### Raíz

| Comando | Acción |
|---|---|
| `npm run dev` | Backend en desarrollo |
| `npm start` | Backend en producción local |
| `npm test` | Tests del backend |
| `npm run install:all` | Instala backend y frontend |
| `npm run db:up` | Levanta PostgreSQL, MongoDB y EMQX |
| `npm run db:down` | Detiene la infraestructura |
| `npm run db:reset` | Borra volúmenes y recrea la infraestructura |
| `npm run db:logs` | Logs de los contenedores |
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run db:migrate` | Crea/aplica migraciones (dev) |
| `npm run db:deploy` | Aplica migraciones existentes |
| `npm run db:seed` | Inserta roles iniciales |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run build` | Build del frontend |
| `npm run lint` | Lint del frontend |

### Backend

| Comando | Acción |
|---|---|
| `npm start` | `node src/server.js` |
| `npm run dev` | `nodemon src/server.js` (requiere `npm i -D nodemon`) |
| `npm test` | `jest --coverage` |
| `npm run test:watch` | Jest en modo watch |
| `npm run prisma` | CLI de Prisma |
| `npm run seed` | Ejecuta `prisma/seed.js` |
| `npm run seed:demo` | Carga datos de demostración (usuarios, drones, misiones, alertas, mantenimientos, predicciones y telemetría) |

### Frontend

| Comando | Acción |
|---|---|
| `npm run dev` | Vite en desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Oxlint |

---

## API

Base: `http://localhost:4000/api`

| Recurso | Endpoint |
|---|---|
| Autenticación | `/auth` |
| Usuarios | `/users` |
| Drones | `/drones` |
| Telemetría | `/telemetry` |
| Misiones | `/missions` |
| Alertas | `/alerts` |
| Mantenimiento | `/maintenance` |
| Dashboard | `/dashboard` |
| Predicciones | `/predictions` |
| Reportes | `/reports` |

Documentación completa: http://localhost:4000/api-docs

### Conexión con el frontend

| Punto | Valor |
|---|---|
| Base REST | `http://localhost:4000/api` |
| Socket.IO | `http://localhost:4000` |
| CORS | origen definido en `FRONTEND_URL` (acepta varios separados por coma) |
| Login | `POST /api/auth/login` → `{ token, user }` |
| Autorización | `Authorization: Bearer <token>` |
| Handshake WebSocket | `io(url, { auth: { token } })` |
| Evento de telemetría | `telemetry:update` |

El frontend incluye un cliente HTTP en `frontend/src/api/client.js`. Mientras
no exista pantalla de login, ese cliente inicia sesión automáticamente con el
usuario demo (`admin@digiflai.com` / `digiflai123`, configurables con
`VITE_DEMO_EMAIL` y `VITE_DEMO_PASSWORD`) y guarda el JWT en `localStorage`.
Es un comportamiento temporal: al implementar el login real basta con llamar
a `login(email, password)` desde el formulario.

Las vistas de `Panel general` y `Flota UAV` ya consultan la API
(`/dashboard`, `/drones`, `/alerts`, `/missions`, `/predictions`,
`/telemetry/drone/:id`). El resto de pestañas sigue usando datos de ejemplo
en `frontend/src/data/mock.js`.

El backend arranca aunque PostgreSQL, MongoDB y MQTT no estén disponibles:
`/health`, `/`, `/api-docs` y la validación de JWT funcionan sin ellos.
Los endpoints que leen o escriben datos requieren las bases de datos activas.

---

## Dependencias

### Backend — producción

| Paquete | Versión |
|---|---|
| `@prisma/adapter-pg` | ^7.10.0 |
| `@prisma/client` | ^7.9.1 |
| `bcrypt` | ^5.1.1 |
| `compression` | ^1.7.4 |
| `cookie-parser` | ^1.4.6 |
| `cors` | ^2.8.5 |
| `dotenv` | ^17.4.2 |
| `exceljs` | ^3.4.0 |
| `express` | ^4.19.2 |
| `express-rate-limit` | ^7.4.1 |
| `helmet` | ^8.0.0 |
| `joi` | ^17.13.3 |
| `jsonwebtoken` | ^9.0.2 |
| `mongoose` | ^8.8.0 |
| `morgan` | ^1.10.0 |
| `mqtt` | ^5.10.1 |
| `pdfkit` | ^0.20.1 |
| `socket.io` | ^4.8.1 |
| `swagger-jsdoc` | ^6.2.8 |
| `swagger-ui-express` | ^5.0.1 |
| `winston` | ^3.17.0 |

### Backend — desarrollo

| Paquete | Versión |
|---|---|
| `@types/node` | ^26.2.0 |
| `jest` | ^29.7.0 |
| `prisma` | ^7.9.1 |
| `supertest` | ^7.0.0 |

### Frontend — producción

| Paquete | Versión |
|---|---|
| `@tailwindcss/postcss` | ^4.3.3 |
| `lucide-react` | ^1.39.0 |
| `postcss` | ^8.5.26 |
| `react` | ^19.2.8 |
| `react-dom` | ^19.2.8 |
| `recharts` | ^3.10.1 |
| `tailwindcss` | ^4.3.3 |

### Frontend — desarrollo

| Paquete | Versión |
|---|---|
| `@babel/core` | ^7.29.7 |
| `@rolldown/plugin-babel` | ^0.2.3 |
| `@types/react` | ^19.2.18 |
| `@types/react-dom` | ^19.2.4 |
| `@vitejs/plugin-react` | ^6.1.0 |
| `babel-plugin-react-compiler` | ^1.0.0 |
| `oxlint` | ^1.79.0 |
| `vite` | ^8.2.2 |

---

## Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| `nodemon: not found` | `nodemon` no está en `devDependencies` | usar `npm start` o `npm i -D nodemon` |
| `P1001: Can't reach database server` | PostgreSQL no disponible | `docker compose ps` y verificar el puerto 5433 |
| Mongo no conecta | variable mal nombrada | usar `MONGO_URL`, no `MONGODB_URI` |
| `jwt must have a secret` | `JWT_SECRET` vacío | definirlo en `backend/.env` |
| Error de CORS | `FRONTEND_URL` distinto al puerto del front | ajustar `FRONTEND_URL` (acepta lista separada por coma) |
| `EADDRINUSE :5433` | otro proceso en el puerto | cambiar `POSTGRES_PORT` y `DATABASE_URL` |
| Error al ejecutar `npm run seed` | `seed.js` instancia `PrismaClient` sin adaptador | reportar al equipo de backend |

---

## Licencia

Por definir.
