export class Usuario {
  constructor(
    public id: number,
    public nome: string,
    public email: string,
    public senha: string,
    public id_cargo: number,
    public id_setor: number
  ) {}
}
