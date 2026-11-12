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

> Solo las variables con prefijo `VITE_` se exponen al navegador.

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
│   ├── assets/
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
