export function getCurrentDateTime(): string {
  const now = new Date();
  //Converte a data para o padrão do mysql "YYYY-MM-DD HH:MM:SS"
  return now.toISOString().slice(0, 19).replace('T', ' ');
}