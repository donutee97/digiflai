import { useEffect, useState } from "react";

/**
 * Ejecuta una petición al montar el componente (o cuando cambian `deps`)
 * y devuelve el estado de carga y error.
 *
 *   const { data, loading, error } = useApiData(() => api.getDrones(), []);
 */
export default function useApiData(loader, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;

        setLoading(true);
        setError(null);

        loader()
            .then((result) => {
                if (alive) setData(result);
            })
            .catch((err) => {
                if (alive) setError(err.message || "Error desconocido");
            })
            .finally(() => {
                if (alive) setLoading(false);
            });

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error };
}
