import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Form, Container, Table, Alert } from 'react-bootstrap';
import { FaListAlt, FaSave, FaTrash, FaEdit } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import RealizarAgServService from '../../services/RealizarAgServService.js';
import CaixaSelecao from '../../Componentes/CaixaSelecaoServicos.jsx';
import { format, parseISO } from 'date-fns';


const realizarAgServService = new RealizarAgServService();


const schema = yup.object().shape({
  nomeSolicitante: yup.string().required('O nome do solicitante é obrigatório.').min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  cpfSolicitante: yup.string().required('O CPF é obrigatório.').matches(/^\d{11}$/, 'O CPF deve ter 11 dígitos.'),
  contatoSolicitante: yup.string().required('O contato é obrigatório.').matches(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'O contato deve estar no formato (00) 00000-0000.'),
  enderecoSolicitante: yup.string().required('O endereço é obrigatório.'),
  bairroSolicitante: yup.string().required('O bairro é obrigatório.'),
  numeroSolicitante: yup.string().required('O número é obrigatório.'),
  dataAgendamento: yup.date().required('A data do agendamento é obrigatória.'),
  horario: yup.string().required('O horário é obrigatório.'),
  descricaoServico: yup.string().required('A descrição do serviço é obrigatória.')
});

function RealizarAgServ() {
  const [agendamento, setAgendamento] = useState({
    id: 0,
    nomeSolicitante: '',
    cpfSolicitante: '',
    contatoSolicitante: '',
    enderecoSolicitante: '',
    bairroSolicitante: '',
    numeroSolicitante: '',
    dataAgendamento: '',
    horario: '',
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
      const dados = await realizarAgServService.obterTodos();
      setListaAgendamentos(dados);
    } catch (error) {
      setErro('Erro ao listar agendamentos.');
    }
  };

  const carregarTiposServicos = async () => {
    try {
      const tipos = await realizarAgServService.obterTodos();
      setTiposServicos(tipos);
    } catch (error) {
      setErro('Erro ao carregar tipos de serviços.');
    }
  };

  useEffect(() => {
    listarAgendamentos(); // 1
    carregarTiposServicos(); // 2

    if (idAgendamento) { // 3
      const obterAgendamento = async () => {
        try {
          const dados = await realizarAgServService.obterPorId(idAgendamento); // 4
          dados.dataAgendamento = format(parseISO(dados.dataAgendamento), 'yyyy-MM-dd'); // 5
          setAgendamento(dados); // 6
        } catch (error) {
          setErro('Erro ao carregar agendamento.'); // 7
        }
      };
      obterAgendamento();
    }
  }, [idAgendamento]); // 8


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
        tipoServico: agendamento.tipoServico.id,
      };

      if (!idAgendamento) {
        await realizarAgServService.adicionar(dados);
        setSucessoMensagem('Agendamento realizado com sucesso!');
      } else {
        await realizarAgServService.atualizar(idAgendamento, dados);
        setSucessoMensagem('Agendamento atualizado com sucesso!');
      }

      setAgendamento({
        id: 0,
        nomeSolicitante: '',
        cpfSolicitante: '',
        contatoSolicitante: '',
        enderecoSolicitante: '',
        bairroSolicitante: '',
        numeroSolicitante: '',
        dataAgendamento: '',
        horario: '',
        descricaoServico: '',
        tipoServico: { id: 0, nome: '' }
      });

      listarAgendamentos();
      navigate('/Agendamentos');
    } catch (error) {
      setErro(`Erro ao salvar o agendamento: ${error.message}`);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      await realizarAgServService.excluir(id);
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
                      name="nomeSolicitante"
                      value={agendamento.nomeSolicitante}
                      onChange={handleChange}
                      isInvalid={!!errors.nomeSolicitante}
                      placeholder="Digite o nome do Solicitante"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nomeSolicitante}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col lg={3}>
                  <Form.Group>
                    <Form.Label>CPF</Form.Label>
                    <Form.Control
                      className="border-secondary"
                      type="text"
                      name="cpfSolicitante"
                      value={agendamento.cpfSolicitante}
                      onChange={handleChange}
                      isInvalid={!!errors.cpfSolicitante}
                      placeholder="Digite o CPF"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cpfSolicitante}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col lg={4}>
                  <Form.Group>
                    <Form.Label>Contato</Form.Label>
                    <Form.Control
                      className="border-secondary"
                      type="text"
                      name="contatoSolicitante"
                      value={agendamento.contatoSolicitante}
                      onChange={handleChange}
                      isInvalid={!!errors.contatoSolicitante}
                      placeholder="(00) 00000-0000"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contatoSolicitante}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Card>
                <Card.Header as="h4">Detalhes do Serviço</Card.Header>
                <Card.Body>
                  <Row className="align-items-center mb-3">
                    <Col lg={7}>
                      <Form.Group>
                        <Form.Label>Tipo de Serviço</Form.Label>
                        <CaixaSelecao
                          enderecoFonteDados="http://localhost:3001/servico"
                          campoChave="id"
                          campoExibicao="nome"
                          funcaoSelecao={handleSelecaoServico}
                          localLista={tiposServicos}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={3}>
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
                        <Form.Label>Horário</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="time"
                          name="horario"
                          value={agendamento.horario}
                          onChange={handleChange}
                          isInvalid={!!errors.horario}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.horario}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <hr />
                  <Row className="align-items-center mb-3">
                    <Col lg={7}>
                      <Form.Group>
                        <Form.Label>Endereço</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="text"
                          name="enderecoSolicitante"
                          value={agendamento.enderecoSolicitante}
                          onChange={handleChange}
                          isInvalid={!!errors.enderecoSolicitante}
                          placeholder="Digite o endereço do local do serviço"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.enderecoSolicitante}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={3}>
                      <Form.Group>
                        <Form.Label>Bairro</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="text"
                          name="bairroSolicitante"
                          value={agendamento.bairroSolicitante}
                          onChange={handleChange}
                          isInvalid={!!errors.bairroSolicitante}
                          placeholder="Digite o bairro"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.bairroSolicitante}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg={2}>
                      <Form.Group>
                        <Form.Label>Número</Form.Label>
                        <Form.Control
                          className="border-secondary"
                          type="text"
                          name="numeroSolicitante"
                          value={agendamento.numeroSolicitante}
                          onChange={handleChange}
                          placeholder="Número"
                        />
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
    </div>
  );
}

export default RealizarAgServ;
