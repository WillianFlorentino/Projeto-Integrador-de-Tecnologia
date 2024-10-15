const Database = require("../database");
const database = new Database();
const ServicoModel = require("./ServicoModel");

class RealizarAgServModel {
    // Atributos privados (prefixados com #) para encapsulamento
    #id;
    #nomeSolicitante;
    #cpfSolicitante;
    #contatoSolicitante;
    #endereco;
    #bairro;
    #numero;
    #tipoServico;
    #data;
    #horario;
    #descricao;

    constructor(id = 0, nomeSolicitante = "", cpfSolicitante = "", contatoSolicitante = "", endereco = "", bairro = "", numero = "", tipoServicoId = null, data = null, horario = null, descricao = "") {
        this.#id = id;  // Certifica-se de que o ID está corretamente atribuído
        this.#nomeSolicitante = nomeSolicitante;
        this.#cpfSolicitante = cpfSolicitante;
        this.#contatoSolicitante = contatoSolicitante;
        this.#endereco = endereco;
        this.#bairro = bairro;
        this.#numero = numero;
        this.#data = data;
        this.#horario = horario;
        this.#descricao = descricao;

        // Carrega o tipo de serviço associado, se o ID for fornecido
        if (tipoServicoId) {
            this.#tipoServico = new ServicoModel();
            this.#tipoServico.id = tipoServicoId;
        }
    }

    // Getters e Setters para cada atributo
    get id() {
        return this.#id;
    }

    set id(novoId) {
        this.#id = novoId;
    }

    // Método toJSON para conversão dos dados em um formato serializável
    toJSON() {
        return {
            nomeSolicitante: this.#nomeSolicitante,
            cpfSolicitante: this.#cpfSolicitante,
            contatoSolicitante: this.#contatoSolicitante,
            endereco: this.#endereco,
            bairro: this.#bairro,
            numero: this.#numero,
            id: this.#tipoServico ? this.#tipoServico.id : null, // Garantir que o ID do tipo de serviço seja usado corretamente
            data: this.#data,
            horario: this.#horario,
            descricao: this.#descricao,
        };
    }

    // Métodos de CRUD usando database
    async obterTodos() {
        const listaAgServ = await database.ExecutaComando(`
            SELECT 
                realizarAgServ.agserv_id, -- Alterado para o nome correto da coluna
                realizarAgServ.agserv_nomeSolicitante,
                realizarAgServ.agserv_cpfSolicitante,
                realizarAgServ.agserv_contatoSolicitante,
                realizarAgServ.agserv_data,
                realizarAgServ.agserv_horario,
                realizarAgServ.agserv_descricao,
                cadastrotiposdeservico.nome AS tipo_servico
            FROM 
                realizarAgServ
            JOIN 
                cadastrotiposdeservico ON realizarAgServ.agserv_tipoServico_id = cadastrotiposdeservico.id -- Verifique se está correto também
            ORDER BY 
                realizarAgServ.agserv_nomeSolicitante ASC

        `);
        return listaAgServ;
    }

    async obterPorId(id) {
        const result = await database.ExecutaComando('SELECT * FROM realizarAgServ WHERE id = ?', [id]);
        return result[0];
    }

    async adicionar() {
        const dadosServico = this.toJSON();
        const query = `
            INSERT INTO realizarAgServ (
                nomeSolicitante, cpfSolicitante, contatoSolicitante, endereco, bairro, 
                numero, id, data, horario, descricao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const valores = [
            dadosServico.nomeSolicitante, 
            dadosServico.cpfSolicitante, 
            dadosServico.contatoSolicitante, 
            dadosServico.endereco,
            dadosServico.bairro, 
            dadosServico.numero, 
            dadosServico.id,
            dadosServico.data, 
            dadosServico.horario,
            dadosServico.descricao
        ];
        await database.ExecutaComandoNonQuery(query, valores);
    }

    // Método atualizar ajustado
    async atualizar() {
        const dadosServico = this.toJSON();
        const query = `
            UPDATE realizarAgServ SET 
                nomeSolicitante = ?, 
                cpfSolicitante = ?, 
                contatoSolicitante = ?, 
                endereco = ?, 
                bairro = ?, 
                numero = ?, 
                id = ?, 
                data = ?, 
                horario = ?, 
                descricao = ?
            WHERE id = ?
        `;
    
        const valores = [
            dadosServico.nomeSolicitante,
            dadosServico.cpfSolicitante,
            dadosServico.contatoSolicitante,
            dadosServico.endereco,
            dadosServico.bairro,
            dadosServico.numero,
            dadosServico.id,
            dadosServico.data,
            dadosServico.horario,
            dadosServico.descricao,
            this.#id
        ];
    
        try {
            console.log('Atualizando serviço com ID:', this.#id);
            await database.ExecutaComandoNonQuery(query, valores);
            console.log('Atualização realizada com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar o serviço:', error);
        }
    }

    async excluir() {
        await database.ExecutaComandoNonQuery('DELETE FROM realizarAgServ WHERE id = ?', [this.#id]);
    }

    async filtrar(termoBusca) {
        const servicos = await database.ExecutaComando('SELECT * FROM realizarAgServ WHERE nomeSolicitante LIKE ?', [`%${termoBusca}%`]);
        return servicos;
    }
}

module.exports = RealizarAgServModel;
