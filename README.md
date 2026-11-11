# DIGIFLAI — SENTINEL Drone

Monorepo: backend (API + bases de datos) + frontend (React).

```
digiflai/
├── backend/                  # Node + Express + Prisma + Mongoose
│   ├── src/
│   ├── prisma/               # schema, migraciones, seed
│   ├── tests/
│   ├── Dockerfile
│   ├── .env                  # configuración local (NO se sube a git)
│   ├── .env.example
│   └── package.json
├── frontend/                 # React + Vite (otro equipo)
├── docker-compose.yml        # infraestructura
├── package.json              # scripts raíz
└── .gitignore
```

---

## 1. Requisitos

| Herramienta | Versión | Estado |
|---|---|---|
| Node.js | >= 20 | ✅ instalado |
| npm | >= 10 | ✅ instalado |
| Podman | >= 4 | ✅ instalado |

> **No necesitas Docker.** En Fedora, Podman ya viene instalado y hace lo mismo.
> Los comandos son casi idénticos: `docker run` → `podman run`.

---

## 2. Servicios y puertos

| Servicio | Imagen | Puerto host | Puerto contenedor |
|---|---|---|---|
| PostgreSQL | postgres:16 | **5433** | 5432 |
| MongoDB | mongo:7 | 27017 | 27017 |
| EMQX (MQTT) | emqx/emqx:5.7 | 1883 / 18083 | igual |
| API | backend/Dockerfile | 4000 | 4000 |

> ⚠️ **PostgreSQL usa el puerto 5433, no 5432.** Ya tienes un PostgreSQL local
> escuchando en 5432; el contenedor usa 5433 para no chocar. Esto ya está
> configurado en `backend/.env` y en `docker-compose.yml`.

---

## 3. Paso a paso (primera vez)

### Paso 1 — Instalar dependencias del backend

```bash
cd backend
npm install
```

Esto crea `backend/node_modules/`. Sin este paso nada funciona:
el proyecto se descargó de GitHub y no trae dependencias.

### Paso 2 — Crear PostgreSQL (contenedor)

```bash
podman run -d --name sentinel-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=admin_db1 \
  -e POSTGRES_DB=sentinel_drone \
  -p 5433:5432 \
  -v sentinel_pgdata:/var/lib/postgresql/data \
  docker.io/library/postgres:16
```

La base de datos `sentinel_drone` se crea automáticamente.
**Las tablas NO**: se crean en el Paso 4.

Verificar:

```bash
podman ps
podman logs -f sentinel-postgres     # Ctrl+C para salir
```

### Paso 3 — Crear MongoDB (contenedor)

```bash
podman run -d --name sentinel-mongo \
  -p 27017:27017 \
  -v sentinel_mongodata:/data/db \
  docker.io/library/mongo:7
```

Verificar:

```bash
podman ps
```

### Paso 4 — Crear las tablas (Prisma)

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

- `generate` → crea el cliente ORM.
- `migrate deploy` → ejecuta `prisma/migrations/*.sql` y crea
  `Role`, `User`, `Drone`, `Mission`, `Alert`, `Maintenance`.

### Paso 5 — Insertar datos iniciales

```bash
npm run seed
```

Inserta los roles: `ADMIN`, `OPERATOR`, `TECHNICIAN`, `RESEARCHER`.

> Necesarios para poder registrar el primer usuario (`register` exige `roleId`).

### Paso 6 — Arrancar el backend

```bash
npm start
```

> ⚠️ Usa `npm start`, **no** `npm run dev`. El script `dev` usa `nodemon`,
> que no está instalado en las dependencias del proyecto.

Debe aparecer:

```
Servidor iniciado en puerto 4000
Entorno: development
```

### Paso 7 — Verificar

- Salud: http://localhost:4000/health
- Documentación: http://localhost:4000/api-docs
- Prisma Studio: `npx prisma studio` → http://localhost:5555

---

## 4. Uso diario

```bash
# ¿Están corriendo los contenedores?
podman ps

# Si están detenidos
podman start sentinel-postgres sentinel-mongo

# Detener
podman stop sentinel-postgres sentinel-mongo

# Backend
cd backend && npm start
```

Tabla de comandos:

| Acción | Comando |
|---|---|
| Ver contenedores | `podman ps` |
| Ver logs Postgres | `podman logs sentinel-postgres` |
| Ver logs Mongo | `podman logs sentinel-mongo` |
| Entrar a Postgres | `psql "postgresql://postgres:admin_db1@localhost:5433/sentinel_drone"` |
| Entrar a Mongo | `podman exec -it sentinel-mongo mongosh` |
| Ver datos (GUI) | `cd backend && npx prisma studio` |
| Nueva migración | `cd backend && npx prisma migrate dev --name nombre` |
| Aplicar migraciones | `cd backend && npx prisma migrate deploy` |
| Reinsertar roles | `cd backend && npm run seed` |

---

## 5. Alternativa: usar `docker-compose.yml`

Ya tienes el archivo en la raíz. Requiere instalar `podman-compose`:

```bash
sudo dnf install podman-compose
podman-compose up -d postgres mongodb mqtt
```

Si prefieres Docker real:

```bash
sudo dnf install podman-compose    # o instalar docker + docker-compose
```

---

## 6. ¿Dónde se guardan los datos?

No hay archivos de BD dentro del proyecto. Están en **volúmenes de Podman**:

```bash
podman volume inspect sentinel_pgdata --format '{{.Mountpoint}}'
podman volume inspect sentinel_mongodata --format '{{.Mountpoint}}'
```

Normalmente en `~/.local/share/containers/storage/volumes/...`.

Borrar todo y empezar de cero:

```bash
podman rm -f sentinel-postgres sentinel-mongo
podman volume rm sentinel_pgdata sentinel_mongodata
```

---

## 7. Estructura de datos

| Base | Qué guarda | Definición |
|---|---|---|
| PostgreSQL | usuarios, roles, drones, misiones, alertas, mantenimiento | `backend/prisma/schema.prisma` |
| MongoDB | telemetría (lat/long, batería, temperatura...) | `backend/src/models/telemetry.model.js` |
| MQTT/EMQX | no guarda; transporta telemetría en tiempo real | — |

---

## 8. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `nodemon: not found` | `npm run dev` sin nodemon instalado | usar `npm start` |
| `Can't reach database server` | Postgres no corre o puerto mal | `podman ps`, revisar puerto 5433 |
| `MONGO_URL is undefined` / Mongo no conecta | falta `.env` o variable mal nombrada | copiar `.env.example` a `.env` |
| `jwt must have a secret` | `JWT_SECRET` vacío | revisar `backend/.env` |
| CORS bloqueado en el navegador | `FRONTEND_URL` no coincide con Vite | ajustar `FRONTEND_URL` (Vite = 5173) |
| `P1001` al migrar | contenedor Postgres aún arrancando | esperar 10s y reintentar |
| Error en `npm run seed` | `seed.js` crea `PrismaClient` sin adaptador | avisar al responsable del backend |

---

## 9. Variables de entorno

Solo existe `backend/.env` (no se sube a git). Plantilla: `backend/.env.example`.

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:admin_db1@localhost:5433/sentinel_drone?schema=public"
MONGO_URL="mongodb://localhost:27017/sentinel_telemetry"
JWT_SECRET=<cadena-larga-aleatoria>
JWT_EXPIRES_IN=8h
MQTT_BROKER=mqtt://localhost:1883
LOG_LEVEL=info
```
