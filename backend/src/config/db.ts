import mysql from 'mysql2/promise';

// Função auxiliar para garantir que a variável existe
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Variável de ambiente ${key} não configurada!`);
  }
  return value;
}

//Segurança de código, sem expor os dados
//Alterar em .env
export const db = mysql.createPool({
    host: getEnvVar('DB_HOST'),
    user: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASS'),
    database: getEnvVar('DB_NAME'),
    port: Number(process.env.DB_PORT) || 3306,
    timezone: 'Z',
})