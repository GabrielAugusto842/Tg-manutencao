import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import { authMiddleware } from "./middleware/authMiddleware";

dotenv.config();

const app: Application = express();
app.use(express.json());


//Conexão com o FRONTEND
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/user", authMiddleware, usuarioRoutes);

app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando porta ${PORT}`));

