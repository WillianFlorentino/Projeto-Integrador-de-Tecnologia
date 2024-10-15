const API_BASE_URL = "http://localhost:3001";

class RealizarAgServService {
    async obterTodos() {
        const response = await fetch(`${API_BASE_URL}/realizaragserv`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao obter todos os agendamentos');
        }
        const dados = await response.json();
        return dados;
    }

    async adicionar(agendamentoDados) {
        try {
            const response = await fetch(`${API_BASE_URL}/realizaragserv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamentoDados)
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar o agendamento');
            }
        } catch (error) {
            throw error;
        }
    }

    async atualizar(idAgendamento, agendamentoDados) {
        try {
            const response = await fetch(`${API_BASE_URL}/realizaragserv/${idAgendamento}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamentoDados)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar o agendamento');
            }
        } catch (error) {
            throw error;
        }
    }

    async obterPorId(id) {
        const response = await fetch(`${API_BASE_URL}/realizaragserv/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao obter o agendamento por ID');
        }
        const dados = await response.json();
        return dados;
    }

    async excluir(idAgendamento) {
        try {
            const response = await fetch(`${API_BASE_URL}/realizaragserv/${idAgendamento}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir o agendamento');
            }
        } catch (error) {
            throw error;
        }
    }

    async filtrar(termoBusca) {
        const response = await fetch(`${API_BASE_URL}/realizaragserv/filtrar/${termoBusca}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao filtrar os agendamentos');
        }
        const dados = await response.json();
        return dados;
    }
}

export default RealizarAgServService;
