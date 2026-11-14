/* ------------------------------------------------------------------
   Cliente HTTP de DigiflAi.

   TEMPORAL: mientras no exista pantalla de login, el cliente inicia
   sesión automáticamente con el usuario demo y guarda el token en
   localStorage. Cuando se implemente el login real, solo hay que
   borrar `login()` de aquí y llamarlo desde el formulario.
------------------------------------------------------------------ */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "digiflai_token";

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || "admin@digiflai.com";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "digiflai123";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function login(email = DEMO_EMAIL, password = DEMO_PASSWORD) {
    const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const body = await res.json();

    if (!res.ok) {
        throw new Error(body.message || "No se pudo iniciar sesión");
    }

    localStorage.setItem(TOKEN_KEY, body.token);
    return body;
}

async function request(path, options = {}, retry = true) {
    let token = getToken();

    if (!token) {
        const session = await login();
        token = session.token;
    }

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });

    // Token vencido: se renueva una sola vez
    if (res.status === 401 && retry) {
        clearToken();
        return request(path, options, false);
    }

    const body = await res.json();

    if (!res.ok) {
        throw new Error(body.message || `Error de API (${res.status})`);
    }

    return body.data;
}

export const api = {
    login,

    getDashboard: () => request("/dashboard"),

    getDrones: (limit = 50) => request(`/drones?limit=${limit}`),

    getAlerts: () => request("/alerts"),

    getMissions: () => request("/missions"),

    createMission: (payload) =>
        request("/missions", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    finishMission: (id) =>
        request(`/missions/${id}/finish`, { method: "PUT" }),

    getMaintenances: (limit = 20) => request(`/maintenance?limit=${limit}`),

    createMaintenance: (payload) =>
        request("/maintenance", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    finishMaintenance: (id) =>
        request(`/maintenance/${id}/finish`, { method: "PUT" }),

    getUsers: (limit = 50) => request(`/users?limit=${limit}`),

    resetDemo: () => request("/demo/reset", { method: "POST" }),

    getPredictions: () => request("/predictions"),

    getTelemetryByDrone: (droneId, limit = 100) =>
        request(`/telemetry/drone/${droneId}?limit=${limit}`)
};
