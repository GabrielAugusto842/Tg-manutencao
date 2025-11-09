import { Usuario } from "./Usuario";

export class Administrador extends Usuario {
    public criarUsuario(nome: string, email: string, senha: string, idCargo: number) {
        console.log("Nome = " + nome);
        console.log("Email = " + email);
        console.log("Senha = " + senha);
        console.log("idCargo = " +  idCargo);
    }

    public criarSetor(nomeSetor: string, descricao: string) {
        console.log("Nome Setor = " + nomeSetor);
        console.log("Descricao = " + descricao);
    }

    public criarMaquina(marca: string, modelo: string | null, tag: string | null, nome: string,
        numeroSerie: number, producaoHora: number, idSetor: number
    ) {
        console.log("Nome = " + nome);
        console.log("modelo = " + modelo);
        console.log("Marca = " + marca);
        console.log("Tag = " + tag);
        console.log("NumeroSerie = " + numeroSerie);
        console.log("producaoPorHora = " + producaoHora);
        console.log("idSetor = " + idSetor);
    }
}