import { useState, useEffect } from "react";
import api from "../../Services/api.jsx";

export function useBacklog(idSetor) {
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBacklog = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = idSetor ? `?idSetor=${idSetor}` : "";

        const response = await api.get(
          `/relatorios/backlog-os-detalhado${params}`
        );

        const data = response.data;
        setBacklog((data || []).sort((a, b) => b.idade_dias - a.idade_dias));
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar backlog.");
      } finally {
        setLoading(false);
      }
    };
    fetchBacklog();
  }, [idSetor]);

  return { backlog, loading, error };
}
