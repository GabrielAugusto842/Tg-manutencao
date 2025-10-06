import bcrypt from "bcryptjs";

async function generate() {
  const senha = "senha123";
  const hash = await bcrypt.hash(senha, 10);
  console.log("Hash gerado para", senha, "=>", hash);
}

generate();