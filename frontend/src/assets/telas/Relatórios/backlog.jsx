import { useState, useEffect } from "react";

const API_URL = "http://localhost:3002/api/relatorios";

// backlog.jsx
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
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:3002/api/relatorios/backlog-os-detalhado${params}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) throw new Error(`Erro ao carregar backlog: ${response.status}`);
        const data = await response.json();
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

