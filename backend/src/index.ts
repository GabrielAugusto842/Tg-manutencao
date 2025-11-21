import "./config/env";
import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import cargoRoutes from "./routes/cargoRoutes";
import estadoRoutes from "./routes/estadoRoutes";
import setorRoutes from "./routes/setorRoutes";
import maquinaRoutes from "./routes/maquinaRoutes";

const app: Application = express();
app.use(express.json());

const allowedOrigin = "http://localhost:5173"; // Use essa variável

// Conexão com o FRONTEND
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

console.log(`CORS Origin configurado: ${allowedOrigin}`); // <-- LINHA DE DIAGNÓSTICO

app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`);
  next();
});

app.use("/api/user", usuarioRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/cargo", cargoRoutes);
app.use("/api/estado", estadoRoutes);
app.use("/api/setores", setorRoutes);
app.use("/api/maquina", maquinaRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Servidor rodando porta ${PORT}`));
