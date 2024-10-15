import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Form, Container, Table, Alert } from 'react-bootstrap';
import { FaListAlt, FaSave, FaTrash, FaEdit, FaBackspace, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup'; // Usando yup para validação
import { format, parseISO } from 'date-fns'; // Usando date-fns para formatação de data
import AgendamentoService from '../../services/AgendamentoService.js';
import CaixaSelecao from '../../Componentes/CaixaSelecaoServicos.jsx';

const agendamentoService = new AgendamentoService();

const schema = yup.object().shape({
  nomeCliente: yup.string().required('O nome do cliente é obrigatório.').min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  cpfCliente: yup.string().required('O CPF é obrigatório.').matches(/^\d{11}$/, 'O CPF deve ter 11 dígitos.'),
  contatoCliente: yup.string().required('O contato é obrigatório.').matches(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'O contato deve estar no formato (00) 00000-0000.'),
  dataAgendamento: yup.date().required('A data do agendamento é obrigatória.'),
  horarioInicio: yup.string().required('O horário de início é obrigatório.'),
  horarioFinal: yup.string().required('O horário final é obrigatório.'),
  descricaoServico: yup.string().required('A descrição do serviço é obrigatória.')
});

function RealizarAgendamento() {
  const [agendamento, setAgendamento] = useState({
    id: 0,
    nomeCliente: '',
    cpfCliente: '',
    contatoCliente: '',
    dataAgendamento: '',
    horarioInicio: '',
    horarioFinal: '',
    descricaoServico: '',
    tipoServico: { id: 0, nome: '' }
  });

  const [listaAgendamentos, setListaAgendamentos] = useState(null);
  const [tiposServicos, setTiposServicos] = useState([]);
  const [sucessoMensagem, setSucessoMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { idAgendamento } = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgendamento((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelecaoServico = (servicoSelecionado) => {
    setAgendamento((prevAgendamento) => ({
      ...prevAgendamento,
      tipoServico: { id: servicoSelecionado.id, nome: servicoSelecionado.nome }
    }));
  };

  const listarAgendamentos = async () => {
    try {
      const dados = await agendamentoService.obterTodos();
      setListaAgendamentos(dados);
    } catch (error) {
      setErro('Erro ao listar agendamentos.');
    }
  };

  const carregarTiposServicos = async () => {
    try {
      const tipos = await agendamentoService.obterTipos();
      setTiposServicos(tipos);
    } catch (error) {
      setErro('Erro ao carregar tipos de serviços.');
    }
  };

  useEffect(() => {
    listarAgendamentos();
    carregarTiposServicos();

    if (idAgendamento) {
      const obterAgendamento = async () => {
        try {
          const dados = await agendamentoService.obterPorId(idAgendamento);
          dados.dataAgendamento = format(parseISO(dados.dataAgendamento), 'yyyy-MM-dd'); // Formata data para exibição no input
          setAgendamento(dados);
        } catch (error) {
          setErro('Erro ao carregar agendamento.');
        }
      };
      obterAgendamento();
    }
  }, [idAgendamento]);

  const validateFields = async () => {
    try {
      await schema.validate(agendamento, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSalvar = async (event) => {
    event.preventDefault();
    const isValid = await validateFields();

    if (!isValid) {
      setErro('Por favor, corrija os erros e tente novamente.');
      return;
    }

    try {
      const dados = {
        ...agendamento,
        tipoServico: agendamento.tipoServico.id, // Enviando o ID do serviço
      };

      if (!idAgendamento) {
        await agendamentoService.adicionar(dados);
        setSucessoMensagem('Agendamento realizado com sucesso!');
      } else {
        await agendamentoService.atualizar(idAgendamento, dados);
        setSucessoMensagem('Agendamento atualizado com sucesso!');
      }

      setAgendamento({
        id: 0,
        nomeCliente: '',
        cpfCliente: '',
        contatoCliente: '',
        dataAgendamento: '',
        horarioInicio: '',
        horarioFinal: '',
        descricaoServico: '',
        tipoServico: { id: 0, nome: '' }
      });

      listarAgendamentos();
      setValidated(false);
      navigate('/Agendamentos');
    } catch (error) {
      setErro(`Erro ao salvar o agendamento: ${error.message}`);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      await agendamentoService.excluir(id);
      setSucessoMensagem('Agendamento excluído com sucesso!');
      listarAgendamentos();
    }
  };

  return (
    <div className="bg-white p-0 rounded shadow w-100" style={{ minHeight: '90vh' }}>
      <h2 className="text-center mb-4">
        <FaListAlt /> REALIZAR AGENDAMENTO DE SERVIÇO
      </h2>

      <Container className="mt-2">
        <Card>
          <Card.Header as="h4">Informações do Solicitante</Card.Header>
          <Card.Body>
            <Form noValidate validated={validated} onSubmit={handleSalvar}>
              <Row className="align-items-center mb-3">
                <Col lg={5}>
                  <Form.Group>
                    <Form.Label>Nome</Form.Label>
                    <Form.Control
                      className="border-secondary"
                      type="text"
                      name="nomeCliente"
                      value={agendamento.nomeCliente}
                      onChange={handleChange}
                      isInvalid={!!errors.nomeCliente}
                      placeholder="Digite o nome do Solicitante"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nomeCliente}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col lg={3}>
                  <Form.Group>
                    <Form.Label>CPF</Form.Label>
                    <Form.Control
                      className="border-secondary"
                      type="text"
                      name="cpfCliente"
                      value={agendamento.cpfCliente}
                      onChange={handleChange}
                      isInvalid={!!errors.cpfCliente}
                      placeholder="Digite o CPF"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cpfCliente}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col lg={4}>
                  <Form.Group>
                    <Form.Label>Contato</Form.Label>
                    <Form.Control
                      className="border-secondary"
                      type="text"
                      name="contatoCliente"
                      value={agendamento.contatoCliente}
                      onChange={handleChange}
                      isInvalid={!!errors.contatoCliente}
                      placeholder="(00) 00000-0000"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contatoCliente}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Card>
                <Card.Header as="h4">Detalhes do Serviço</Card.Header>
                <Card.Body>
                  <Row className="align-items-center mb-3">
                    <Col lg={6}>
                      <Form.Group>
                        <Form.Label>Tipo de Serviço</Form.Label>
                        <CaixaSelecao
                          enderecoFonteDados="http://localhost:3001/tiposdeservico"
                          campoChave="id"
                          campoExibicao="nome"
                          funcaoSelecao={handleSelecaoServico}
                          localLista={tiposServicos}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={2}>
                      <Form.Group>
                        <Form.Label>Data</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="date"
                          name="dataAgendamento"
                          value={agendamento.dataAgendamento}
                          onChange={handleChange}
                          isInvalid={!!errors.dataAgendamento}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.dataAgendamento}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={2}>
                      <Form.Group>
                        <Form.Label>Horário Inicial</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="time"
                          name="horarioInicio"
                          value={agendamento.horarioInicio}
                          onChange={handleChange}
                          isInvalid={!!errors.horarioInicio}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.horarioInicio}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={2}>
                      <Form.Group>
                        <Form.Label>Horário Final</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="time"
                          name="horarioFinal"
                          value={agendamento.horarioFinal}
                          onChange={handleChange}
                          isInvalid={!!errors.horarioFinal}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.horarioFinal}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="align-items-center mb-3">
                    <Col lg={12}>
                      <Form.Group>
                        <Form.Label>Descrição Completa do Serviço</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          as="textarea"
                          rows={3}
                          name="descricaoServico"
                          value={agendamento.descricaoServico}
                          onChange={handleChange}
                          isInvalid={!!errors.descricaoServico}
                          placeholder="Digite uma descrição detalhada do serviço"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.descricaoServico}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="align-items-center d-md-flex justify-content-md-center">
                    <Col lg={2}>
                      <Button variant="success" type="submit" className="w-100">
                        <FaSave /> Agendar
                      </Button>
                    </Col>
                  </Row>

                  {sucessoMensagem && (
                    <Alert variant="success" className="mt-3">
                      {sucessoMensagem}
                    </Alert>
                  )}
                  {erro && (
                    <Alert variant="danger" className="mt-3">
                      {erro}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <Container className="mt-2">
        <Card>
          <Card.Header as="h5">Agendamentos Realizados</Card.Header>
          <Card.Body>
            {listaAgendamentos !== null && (
              <Table className="border-success mt-2">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th colSpan={3}>Nome do Cliente</th>
                    <th colSpan={2}>Data</th>
                    <th colSpan={2}>Horário</th>
                    <th colSpan={2}>Serviço</th>
                    <th colSpan={2}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaAgendamentos.length <= 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center">Nenhum item para listar</td>
                    </tr>
                  ) : (
                    listaAgendamentos.map((agendamento) => (
                      <tr key={agendamento.id}>
                        <td>{agendamento.id}</td>
                        <td colSpan={3}>{agendamento.nomeCliente}</td>
                        <td colSpan={2}>{agendamento.dataAgendamento}</td>
                        <td colSpan={2}>{`${agendamento.horarioInicio} - ${agendamento.horarioFinal}`}</td>
                        <td colSpan={2}>{agendamento.tipoServico.nome}</td>
                        <td>
                          <div className="d-flex justify-content-around">
                            <Button variant="link" onClick={() => handleExcluir(agendamento.id)} className="text-danger">
                              <FaTrash />
                            </Button>
                            <Button variant="link" onClick={() => navigate(`/editar-agendamento/${agendamento.id}`)} className="text-primary">
                              <FaEdit />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default RealizarAgendamento;
