const API_BASE_URL = "http://localhost:3001";

class AgendamentoService {
    async obterTodos() {
        const response = await fetch(`${API_BASE_URL}/agendamentos`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('Erro ao obter todos os agendamentos');
            throw new Error('Erro ao obter todos os agendamentos');
        } else {
            const dados = await response.json();
            return dados;
        }
    }

    async adicionar(agendamentoDados) {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamentoDados)
            });

            if (!response.ok) {
                console.log('Erro ao adicionar o agendamento!');
                throw new Error('Erro ao adicionar o agendamento');
            }
        } catch (error) {
            throw error;
        }
    }

    async atualizar(idAgendamento, agendamentoDados) {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos/${idAgendamento}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agendamentoDados)
            });

            if (!response.ok) {
                console.log('Erro ao atualizar o agendamento!');
                throw new Error('Erro ao atualizar o agendamento');
            }
        } catch (error) {
            throw error;
        }
    }

    async obterPorId(id) {
        const response = await fetch(`${API_BASE_URL}/agendamentos/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('Erro ao obter o agendamento por ID');
            throw new Error('Erro ao obter o agendamento por ID');
        } else {
            const dados = await response.json();
            return dados;
        }
    }

    async excluir(idAgendamento) {
        try {
            const response = await fetch(`${API_BASE_URL}/agendamentos/${idAgendamento}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.log('Erro ao excluir o agendamento!');
                throw new Error('Erro ao excluir o agendamento');
            }
        } catch (error) {
            throw error;
        }
    }

    async filtrar(termoBusca) {
        const response = await fetch(`${API_BASE_URL}/agendamentos/filtrar/${termoBusca}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('Erro ao filtrar os agendamentos');
            throw new Error('Erro ao filtrar os agendamentos');
        } else {
            const dados = await response.json();
            return dados;
        }
    }
}

export default AgendamentoService;
