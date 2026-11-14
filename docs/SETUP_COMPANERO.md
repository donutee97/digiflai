# Replicar DigiflAi en otro computador

Guía para que un compañero tenga **exactamente el mismo sistema funcionando**:
backend local, PostgreSQL local (el mismo que ya administra en DBeaver),
MongoDB y MQTT en Docker, frontend en Docker y los mismos datos de demostración.

> Esta guía asume Linux o macOS con terminal. En Windows funciona igual desde
> Git Bash o WSL, cambiando las rutas.

---

## 0. Lo que debe tener instalado

| Herramienta | Versión recomendada | Verificar con |
|---|---|---|
| Git | cualquiera reciente | `git --version` |
| Node.js | 20 LTS o 22 LTS | `node -v` |
| npm | incluido con Node | `npm -v` |
| Docker + Compose | Docker Desktop o Engine reciente | `docker compose version` |
| PostgreSQL local | 14 o superior | `psql --version` |
| DBeaver | cualquiera reciente | — |

También deben estar libres los puertos **4000** (API), **5173** (frontend),
**27017** (MongoDB) y **1883** (MQTT).

---

## 1. Arquitectura que va a quedar

```text
Navegador
   │
   ├── http://localhost:5173  → frontend (contenedor Nginx)
   │
   └── http://localhost:4000  → backend Node local
                                   │
                                   ├── PostgreSQL local :5432  (datos del negocio)
                                   ├── MongoDB Docker   :27017 (telemetría)
                                   └── EMQX Docker      :1883  (MQTT, opcional para la demo)
```

**Importante:** el PostgreSQL que se usa es el **local del compañero**, no el
contenedor `postgres` de `docker-compose.yml`. Por eso **no** se debe ejecutar
`docker compose up -d` sin indicar servicios.

---

## 2. Preparar la base de datos en DBeaver

La base debe llamarse `digiflai` y **estar vacía** para que las migraciones y
el sembrado creen todo desde cero.

En DBeaver, conéctese a la base `postgres` (no a `digiflai`) y ejecute:

```sql
DROP DATABASE IF EXISTS digiflai WITH (FORCE);
CREATE DATABASE digiflai;
```

Si su PostgreSQL es anterior a la versión 13, `WITH (FORCE)` no existe:
cierre las conexiones de DBeaver a `digiflai` y ejecute solo:

```sql
DROP DATABASE digiflai;
CREATE DATABASE digiflai;
```

> Si no quiere borrar la base actual, cree otra con otro nombre, por ejemplo
> `digiflai_demo`, y use ese nombre en `DATABASE_URL`. Los datos serán los
> mismos, pero el nombre no.

Verifique que quede vacía: no debe tener tablas.

---

## 3. Clonar el repositorio

```bash
git clone https://github.com/donutee97/digiflai.git
cd digiflai
```

> El dueño del repositorio debe haber subido primero los últimos cambios.

---

## 4. Configurar el backend

```bash
cd backend
cp .env.example .env
npm install
```

Abra `backend/.env` y déjelo así, cambiando **solo** `TU_CLAVE` por la clave
real de su PostgreSQL local:

```env
PORT=4000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173

DATABASE_URL="postgresql://postgres:TU_CLAVE@localhost:5432/digiflai?schema=public"

MONGO_URL="mongodb://localhost:27017/digiflai_telemetry"

JWT_SECRET=CAMBIE_ESTO_POR_UNA_CLAVE_LARGA
JWT_EXPIRES_IN=8h

MQTT_BROKER=mqtt://localhost:1883

LOG_LEVEL=info

RATE_LIMIT_MAX=1000
AUTH_RATE_LIMIT_MAX=200
```

Detalles que suelen fallar:

- El puerto del PostgreSQL local es **5432**, no 5433. El 5433 es el del
  contenedor y aquí no se usa.
- Si el usuario de PostgreSQL no es `postgres`, cámbielo en la URL.
- Si la clave tiene `@`, `:`, `/`, `#` o `%`, debe codificarla para URL.
  Por ejemplo, `Mi@Clave` se escribe `Mi%40Clave`.
- Genere un `JWT_SECRET` real con:

```bash
openssl rand -hex 32
```

Copie el resultado y reemplácelo en `.env`.

---

## 5. Levantar solo MongoDB y MQTT

Desde la **raíz** del proyecto:

```bash
cd ..
docker compose up -d mongodb mqtt
```

Espere a que MongoDB esté saludable:

```bash
docker compose ps
```

Debe ver `mongodb` en `healthy` y `mqtt` en `Up`.

> **No ejecute `docker compose up -d` a secas.** Ese comando también intenta
> arrancar el contenedor `postgres` (puerto 5433) y el contenedor `api`
> (puerto 4000), que chocarían con el PostgreSQL local y con el backend local.
>
> Si ya lo ejecutó por error:
>
> ```bash
> docker compose stop api postgres
> ```

---

## 6. Crear el esquema y cargar los datos

Con MongoDB ya encendido:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run seed:demo
```

`npm run seed:demo` es el que carga **todos los datos de la demostración**.
Debe terminar mostrando algo muy parecido a:

```text
Sembrando datos de demostración...
PostgreSQL:
  usuarios:      5
  drones:        6
  misiones:      4
  alertas:       4
  mantenimiento: 3
  predicciones:  4
MongoDB: 30 lecturas de telemetría
Contraseña de usuarios demo: digiflai123
```

Si MongoDB no estaba listo, el sembrado de PostgreSQL puede alcanzar a
ejecutarse pero la telemetría se omite o falla. En ese caso, espere a que
MongoDB esté `healthy` y vuelva a ejecutar:

```bash
npm run seed:demo
```

`seed:demo` es seguro de repetir: limpia drones, misiones, alertas,
mantenimientos y predicciones, y vuelve a dejar el conjunto de demostración.
No borra usuarios existentes; los usuarios demo se actualizan por correo.

---

## 7. Arrancar el backend

```bash
npm start
```

Debe quedar en primer plano. Verifique en otra terminal:

```bash
curl http://localhost:4000/health
```

Respuesta esperada:

```json
{"status":"ok","timestamp":"...","uptime":...,"environment":"development"}
```

| Recurso | URL |
|---|---|
| API | http://localhost:4000 |
| Salud | http://localhost:4000/health |
| Swagger | http://localhost:4000/api-docs |

> No use `npm run dev`: el proyecto no tiene `nodemon` instalado y falla.
> Use `npm start`.

---

## 8. Arrancar el frontend

### Opción A — Frontend en Docker (igual que el entorno actual)

En otra terminal, desde la raíz:

```bash
cd /ruta/al/proyecto/digiflai
docker compose up -d --no-deps --build frontend
```

Abra **http://localhost:5173**.

El parámetro `--no-deps` es obligatorio: evita que Docker arranque el
contenedor `api` y respeta el backend local del paso 7.

### Opción B — Frontend con Vite (sin contenedor)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abra la URL que muestre Vite (normalmente **http://localhost:5173**).

En ambas opciones el navegador habla con `http://localhost:4000/api`, que es
el backend local.

---

## 9. Verificar que quedó idéntico

### 9.1 Abrir la aplicación

http://localhost:5173

Debe abrir directamente en la pestaña **Operaciones**.

Pruebe:

1. **Flujo A**: elegir un dron → **Asignar misión** → **Finalizar misión**.
2. **Flujo C**: ver la predicción de 94 % → **Programar mantenimiento** →
   **Finalizar mantenimiento**.
3. **Reiniciar demo**: debe dejar todo como al inicio.

### 9.2 Iniciar sesión

Credenciales (todos los usuarios demo usan la misma contraseña):

| Correo | Rol |
|---|---|
| `admin@digiflai.com` | ADMIN |
| `h.moreno@digiflai.com` | OPERATOR |
| `c.pinilla@digiflai.com` | OPERATOR |
| `j.salas@digiflai.com` | TECHNICIAN |
| `a.rua@digiflai.com` | TECHNICIAN |

Contraseña: `digiflai123`

En la interfaz no hay pantalla de login: el cliente inicia sesión solo con el
usuario `admin@digiflai.com`. Las credenciales se usan para Swagger o para
probar la API con `curl`.

### 9.3 Verificar los datos en PostgreSQL

En DBeaver, refresque la base `digiflai` y consulte:

```sql
SELECT COUNT(*) FROM "User";         -- 5
SELECT COUNT(*) FROM "Drone";        -- 6
SELECT COUNT(*) FROM "Mission";      -- 4
SELECT COUNT(*) FROM "Alert";        -- 4
SELECT COUNT(*) FROM "Maintenance";  -- 3
SELECT COUNT(*) FROM "Prediction";   -- 4
```

### 9.4 Verificar la telemetría en MongoDB

```bash
docker compose exec mongodb mongosh --quiet \
  --eval 'db.getSiblingDB("digiflai_telemetry").telemetries.countDocuments()'
```

Debe responder `30`.

### 9.5 Verificar el estado inicial de los drones

| Código | Estado inicial |
|---|---|
| SD-0001 | AVAILABLE |
| SD-0002 | IN_MISSION |
| SD-0003 | MAINTENANCE |
| SD-0004 | AVAILABLE |
| SD-0005 | IN_MISSION |
| SD-0006 | OFFLINE |

En la interfaz se ven como OPERATIVO, EN MISIÓN, MANTENIMIENTO y FUERA DE
SERVICIO.

---

## 10. Restaurar los datos cuando quiera

| Situación | Acción |
|---|---|
| Terminó una visita en el stand | Botón **Reiniciar demo** en la pestaña Operaciones |
| Quiere restaurar todo el conjunto | `cd backend && npm run seed:demo` |
| Quiere borrar y recrear desde cero | Recrear la base con DBeaver y repetir migraciones + seeds |

`Reiniciar demo` solo borra registros creados desde la pestaña Operaciones
(los que empiezan por `[DEMO]`). `seed:demo` sí reemplaza todo el conjunto de
demostración.

---

## 11. Errores frecuentes

| Error | Causa probable | Solución |
|---|---|---|
| `P1001: Can't reach database server at localhost:5432` | PostgreSQL apagado o puerto/usuario incorrecto | Abra DBeaver, confirme la conexión y revise `DATABASE_URL` |
| `P1000: Authentication failed` | Clave incorrecta o carácter sin codificar | Corrija la clave en `DATABASE_URL`; codifique `@`, `:`, etc. |
| `database "digiflai" does not exist` | La base no está creada | Créela en DBeaver |
| Migración falla porque las tablas ya existen | La base no estaba vacía | Recrear la base y repetir el paso 2 |
| `Port 4000 is already in use` | Contenedor `api` o otro backend corriendo | `docker compose stop api`; verificar con `lsof -i :4000` (Linux/macOS) |
| `ECONNREFUSED 127.0.0.1:27017` al sembrar | MongoDB no está arriba | `docker compose up -d mongodb`, esperar `healthy`, repetir `npm run seed:demo` |
| El frontend carga pero no muestra datos | Backend apagado o URL de API incorrecta | Abrir http://localhost:4000/health; revisar Network en el navegador |
| `429 Too Many Requests` | Límite de peticiones | Verificar `RATE_LIMIT_MAX=1000` y reiniciar el backend |
| `nodemon: not found` | Se usó `npm run dev` | Usar `npm start` |
| `Cannot find module '@prisma/client'` | Falta generar el cliente | `npx prisma generate` |
| Se levantó todo con Docker y la API usa una base vacía | Se ejecutó `docker compose up -d` | `docker compose stop api postgres` y usar el backend local |

---

## 12. Antes de subir a GitHub

El archivo `.env` **no** se sube: el `.gitignore` ya lo excluye. Solo se
versionan los `.env.example`.

Verificar:

```bash
git status
```

No debe aparecer `backend/.env` ni `frontend/.env`. Sí deben aparecer los
cambios de código y la carpeta `docs/`.

Para publicar:

```bash
git add .
git commit -m "Operaciones: flujos A y C, reinicio de demo y guía de instalación"
git push origin main
```

El compañero debe clonar **después** de ese `push`.
