import http, { IncomingMessage, ServerResponse } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "./config/db"; // sua conexão MySQL
import bcrypt from "bcryptjs";

interface RequestWithBody extends IncomingMessage {
  body?: any;
}

// Função para ler JSON do corpo da requisição
const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    });
  });
};

const authMiddleware = async (req: IncomingMessage): Promise<string> => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || Array.isArray(authHeader))
    throw new Error("Token não fornecido");

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer")
    throw new Error("Token malformado");

  const token: string = parts[1]!;

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definido");

  const decoded = await new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as JwtPayload);
    });
  });

  if (!decoded.email) throw new Error("Token inválido: email ausente");

  return decoded.email;
};

// Função para atualizar senha no MySQL
const updatePassword = async (
  email: string,
  senhaAtual: string,
  novaSenha: string
) => {
  const [rows] = await db.query("SELECT * FROM usuario WHERE email = ?", [
    email,
  ]);
  const user = (rows as any)[0];
  if (!user) throw new Error("Usuário não encontrado");

  const isSenhaCorreta = await bcrypt.compare(senhaAtual, user.senha);
  if (!isSenhaCorreta) throw new Error("Senha atual incorreta");

  const salt = await bcrypt.genSalt(10);
  const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

  const [result] = await db.execute(
    "UPDATE usuario SET senha = ? WHERE id_usuario = ?",
    [novaSenhaHash, user.id_usuario]
  );
  if ((result as any).affectedRows === 0)
    throw new Error("Erro ao atualizar senha");
};

// Servidor HTTP puro só para troca de senha
const server = http.createServer(
  async (req: RequestWithBody, res: ServerResponse) => {
    // 1️⃣ Cabeçalhos CORS
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // React
    res.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // 2️⃣ Preflight request (OPTIONS)
    if (req.method === "OPTIONS") {
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    // 3️⃣ Rota de troca de senha
    if (req.url === "/trocar-senha" && req.method === "PUT") {
      try {
        const email = await authMiddleware(req);
        const body = await parseBody(req);
        const { senhaAtual, novaSenha } = body;

        if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Dados inválidos: nova senha mínimo 6 caracteres",
            })
          );
          return;
        }

        await updatePassword(email, senhaAtual, novaSenha);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Senha alterada com sucesso!",
            forceLogout: true,
          })
        );
      } catch (error: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: error.message || "Erro interno" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Rota não encontrada");
    }
  }
);

const PORT = process.env.TROCAR_SENHA_PORT || 3002; // pode ser outra porta que não conflite com Express
server.listen(PORT, () =>
  console.log(`Servidor de troca de senha rodando na porta ${PORT}`)
);
