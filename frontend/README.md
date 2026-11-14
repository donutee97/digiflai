# DigiflAi — Frontend

Panel de control de flota UAV construido con **React 19 + Vite 8 + Tailwind CSS 4**.

## Requisitos

- Node.js >= 20
- npm >= 10

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Disponible en http://localhost:5173

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:4000/api` |
| `VITE_SOCKET_URL` | Servidor Socket.IO | `http://localhost:4000` |
| `VITE_DEMO_EMAIL` | Usuario del login automático temporal | `admin@digiflai.com` |
| `VITE_DEMO_PASSWORD` | Contraseña del login automático temporal | `digiflai123` |

> Solo las variables con prefijo `VITE_` se exponen al navegador.

## Consumo de la API

Las vistas `Panel general` (`src/views/TabDashboard.jsx`) y `Flota UAV`
(`src/views/TabFlota.jsx`) leen datos reales del backend:

- `src/api/client.js` centraliza las peticiones y añade el JWT.
- `src/api/mappers.js` traduce los enums de PostgreSQL al formato visual.
- `src/hooks/useApiData.js` maneja carga, error y cancelación al desmontar.

La vista `Operaciones` (`src/views/TabOperaciones.jsx`) es la demostración
para el stand: crea y finaliza una misión (flujo A), programa y finaliza un
mantenimiento a partir de una predicción de la IA (flujo C) y permite
reiniciar la demo con `POST /demo/reset`. Los registros que crea llevan el
prefijo `[DEMO]` para poder borrarlos sin tocar los datos sembrados.

Mientras no exista pantalla de login, `client.js` inicia sesión
automáticamente con `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD` y guarda el
token en `localStorage`. Es temporal: al crear el formulario de login, llama
a `login(email, password)` y elimina la llamada automática.

El resto de pestañas (telemetría, misiones, alertas, mantenimiento, IA,
gemelo digital) todavía usan `src/data/mock.js`.

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |
| `npm run lint` | Oxlint |

## Docker

El frontend incluye `Dockerfile` (build con Node + servido con Nginx).

```bash
# Solo el frontend
docker build -t digiflai-frontend .
docker run -p 5173:80 digiflai-frontend

# Desde la raíz del repo
docker compose up -d --build --no-deps frontend
```

> Las variables `VITE_*` se **incrustan en el bundle durante el build**.
> Para cambiarlas usa `--build-arg` o reconstruye:
> `docker compose build --no-cache frontend`

## Estructura

```
frontend/
├── public/
├── src/
│   ├── api/                        # cliente HTTP y mapeadores
│   ├── assets/
│   ├── components/                 # ui, charts, layout
│   ├── data/mock.js                # datos de ejemplo (pestañas sin API)
│   ├── hooks/                      # useApiData
│   ├── views/                      # pestañas del panel
│   │   ├── TabDashboard.jsx        # Panel general (API)
│   │   ├── TabFlota.jsx            # Flota UAV (API)
│   │   └── TabOperaciones.jsx      # flujos del stand + Reiniciar demo
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── nginx.conf
├── Dockerfile
└── package.json
```

## Dependencias

**Producción:** `react`, `react-dom`, `recharts`, `lucide-react`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`

**Desarrollo:** `vite`, `@vitejs/plugin-react`, `@rolldown/plugin-babel`, `babel-plugin-react-compiler`, `@babel/core`, `oxlint`, `@types/react`, `@types/react-dom`

Versiones exactas en `package.json`.
