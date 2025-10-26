import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    email?: string;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(403).json({ message: "Token não fornecido" });
    return;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") {
    res
      .status(403)
      .json({ message: "Token malformado (Formato: Bearer <token>)" });
    return;
  }

  const token = parts[1];

  if (!token) {
    // 👈 garante que não é undefined
    res.status(403).json({ message: "Token ausente após Bearer" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Token inválido" });
      return;
    }
    req.email = (decoded as JwtPayload).email;
    next();
  });
};
