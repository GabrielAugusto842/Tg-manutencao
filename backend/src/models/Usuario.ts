export class Usuario {
    // 🛑 id_usuario agora é o nome da propriedade chave primária e é tipado como number.
    public id_usuario: number;
    public nome: string;
    public email: string;
    public senha: string; // Em produção, a senha deve ser tipada como hash (string)
    public id_cargo: number;
    public id_setor: number;
    
    constructor(
        id_usuario: number, // Corrigido para usar o nome da propriedade
        nome: string,
        email: string,
        senha: string,
        id_cargo: number,
        id_setor: number
    ) {
        this.id_usuario = id_usuario;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.id_cargo = id_cargo;
        this.id_setor = id_setor;
    }
}