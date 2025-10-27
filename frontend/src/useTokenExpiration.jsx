import { useEffect } from "react";

export function useTokenExpiration() {
  useEffect(() => {

    const CHECK_INTERVAL = 300000;


    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Decodifica o payload do JWT manualmente
        const payloadBase64 = token.split(".")[1];
        if (!payloadBase64) throw new Error("Token inválido");

        const decodedPayload = JSON.parse(atob(payloadBase64));
        const { exp } = decodedPayload;

        if (exp * 1000 < Date.now()) {
          alert("Sessão expirada. Faça login novamente.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Erro ao decodificar token", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }, 300000); // verifica a cada 5s

    return () => clearInterval(interval);
  }, []);
}
