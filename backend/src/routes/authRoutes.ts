import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const users = [
  {
    email: "email@os.com",
    password: "$2b$10$cCmzqOn/P5cxrOr/tJa0JOqKzzXmA20XiNO829nAGq.DMgBe8tNX2",
  },
];

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  res.json({ token });
});

export default router;
