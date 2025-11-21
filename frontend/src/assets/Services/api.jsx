import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de REQUISIÇÃO: Adiciona o token antes de enviar a chamada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Adiciona o cabeçalho Authorization com o token no formato Bearer
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPOSTA: Verifica se o token está inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const isAuthError = [401, 403].includes(error.response?.status);
    const isLoginRoute = originalRequest?.url?.includes("/auth/login");

    if (isAuthError && !isLoginRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
