import './config/env';
import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import cargoRoutes from "./routes/cargoRoutes";
import estadoRoutes from "./routes/estadoRoutes";

const app: Application = express();
app.use(express.json());


app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`);
  next();
});

//Conexão com o FRONTEND
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

//app.use("/api/user", usuarioRoutes);

//app.use("/api/auth", authRoutes);

app.use('/api/cargos', cargoRoutes);
app.use('/api/estados', estadoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando porta ${PORT}`));


