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
└── package.json
```

## Dependencias

**Producción:** `react`, `react-dom`, `recharts`, `lucide-react`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`

**Desarrollo:** `vite`, `@vitejs/plugin-react`, `@rolldown/plugin-babel`, `babel-plugin-react-compiler`, `@babel/core`, `oxlint`, `@types/react`, `@types/react-dom`

Versiones exactas en `package.json`.
