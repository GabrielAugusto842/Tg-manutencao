import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";
import listEndpoints from "express-list-endpoints";

dotenv.config();

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

app.use("/api/user", usuarioRoutes);

app.use("/api/auth", authRoutes);

console.table(listEndpoints(app));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando porta ${PORT}`));


