import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

interface Indicador {
  id: number;
  nome: string;
  agrupador: string;
  pontos_atual: number;
  pontos_maximo: number;
  meta_mensal: number;
  meta_acumulada: number;
  realizado_mensal: number;
  realizado_acumulado: number;
  meta_extra_porcentagem: number;

}


const Indicadores: React.FC = () => {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("Todos");
  const [indicadorEditando, setIndicadorEditando] = useState<Indicador | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMensal, setEditMensal] = useState(0);
  const [editAcumulado, setEditAcumulado] = useState(0);
  const [showNovo, setShowNovo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoGrupo, setNovoGrupo] = useState("");
  const [novoMetaMensal, setNovoMetaMensal] = useState(0);
  const [novoMetaAcumulada, setNovoMetaAcumulada] = useState(0);
  const [novoRealizadoMensal, setNovoRealizadoMensal] = useState(0);
  const [novoRealizadoAcumulado, setNovoRealizadoAcumulado] = useState(0);
  const [agrupadores, setAgrupadores] = useState<string[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [valorHistorico, setValorHistorico] = useState(0);
  const [indicadorSelecionado, setIndicadorSelecionado] = useState<Indicador | null>(null);
  const [novoMetaExtra, setNovoMetaExtra] = useState(120); // valor padrão


  
  const abrirModalHistorico = (indicador: Indicador) => {
    setIndicadorSelecionado(indicador);
    setValorHistorico(0);
    setShowHistorico(true);
  };
  

  const buscarIndicadores = () => {
    axios.get("http://localhost:8000/indicadores")
      .then((res) => setIndicadores(res.data))
      .catch((err) => console.error("Erro ao buscar indicadores:", err));
  };

  useEffect(() => {
    buscarIndicadores();
    axios.get("http://localhost:8000/agrupadores")
      .then((res) => setAgrupadores(res.data))
      .catch((err) => console.error("Erro ao buscar agrupadores:", err));

  }, []);

  const grupos = Array.from(new Set(indicadores.map((i) => i.agrupador))).sort();
  const filtrados = grupoSelecionado === "Todos" ? indicadores : indicadores.filter(i => i.agrupador === grupoSelecionado);

  const abrirModal = (indicador: Indicador) => {
    setIndicadorEditando(indicador);
    setEditMensal(indicador.realizado_mensal);
    setEditAcumulado(indicador.realizado_acumulado);
    setShowModal(true);
  };

  const salvarAlteracoes = () => {
    if (!indicadorEditando) return;

    axios.put(`http://localhost:8000/indicadores/${indicadorEditando.id}`, {
      realizado_mensal: editMensal,
      realizado_acumulado: editAcumulado,
    }).then(() => {
      setShowModal(false);
      buscarIndicadores();
    }).catch((err) => {
      alert("Erro ao atualizar indicador");
      console.error(err);
    });
  };
  const excluirIndicador = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este indicador?")) {
      axios.delete(`http://localhost:8000/indicadores/${id}`)
        .then(() => buscarIndicadores())
        .catch(() => alert("Erro ao excluir indicador"));
    }
  };
  const agrupados = filtrados.reduce((acc: any, indicador) => {
    const grupo = indicador.agrupador || "Outros";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(indicador);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Indicadores</h2>
        <button className="btn btn-outline-primary" onClick={buscarIndicadores}>
          🔄 Atualizar Dados
        </button>
        <button
          className="btn btn-outline-success ms-2"
          onClick={() => setShowNovo(true)}
        >
          ➕ Novo Indicador
        </button>
      </div>

      <div className="mb-4">
        <label className="form-label">Filtrar por grupo:</label>
        <select className="form-select" value={grupoSelecionado} onChange={(e) => setGrupoSelecionado(e.target.value)}>
          <option value="Todos">Todos</option>
          {grupos.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {Object.keys(agrupados).map((grupo) => (
        <div key={grupo} className="mb-5">
          <h4>{grupo}</h4>
          <div className="row">
            {agrupados[grupo].map((i: Indicador) => {
              const percentual = i.meta_mensal ? Math.round((i.realizado_mensal / i.meta_mensal) * 100) : 0;
              const pctMensal = i.meta_mensal ? (i.realizado_mensal / i.meta_mensal) * 100 : 0;
              // const superouMetaExtra = i.realizado_mensal >= (i.meta_mensal * (i.meta_extra_porcentagem / 100));
              const superouMetaExtra = i.realizado_mensal >= (
                i.meta_mensal * ((i.meta_extra_porcentagem ?? 120) / 100)
              );
              const cor = percentual >= 100 ? "success" : "secondary";

              return (
                <div key={i.id} className="col-md-4">
                  <div className={`card border-${cor} mb-3`}>
                    <div className={`card-header bg-${cor} text-white`}>
                      {i.nome}
                      <button
                        className="btn btn-sm btn-danger ms-2"
                        onClick={() => excluirIndicador(i.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="card-body">
  <p><strong>Meta mensal:</strong> {(i.meta_mensal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
  <p><strong>Realizado mensal:</strong> {(i.realizado_mensal ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
  {i.realizado_mensal < i.meta_mensal && (
    <p className="text-warning">
      🔻 Faltam {(i.meta_mensal - i.realizado_mensal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para bater a meta mensal
    </p>
  )}
  {superouMetaExtra && (
  <span className="badge bg-warning text-dark ms-2">👑 Meta extra batida</span>
)}
<div className="mb-2">
    <small><strong>Atingimento mensal:</strong> {Math.round((i.realizado_mensal / i.meta_mensal) * 100)}%</small>
    <div className="progress">
      <div
        className={`progress-bar bg-${i.realizado_mensal / i.meta_mensal >= 1 ? "success" : "secondary"}`}
        role="progressbar"
        style={{ width: `${Math.min(150, (i.realizado_mensal / i.meta_mensal) * 100)}%` }}
      >
        {Math.round((i.realizado_mensal / i.meta_mensal) * 100)}%
      </div>
    </div>
  </div>
  {/* Separador visual */}
  <hr className="my-3" />
<p><strong>Meta extra:</strong> {
  (i.meta_mensal * ((i.meta_extra_porcentagem ?? 120) / 100)).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  })
}</p>
  

  {/* Separador visual */}
  {/* <hr className="my-3" /> */}

  { i.meta_acumulada > 0 && (
  <>
    <hr className="my-3" />

    <p><strong>Meta acumulada:</strong> {(i.meta_acumulada).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
    <p><strong>Realizado acumulado:</strong> {(i.realizado_acumulado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>

    {i.realizado_acumulado < i.meta_acumulada && (
      <p className="text-warning">
        🔻 Faltam {(i.meta_acumulada - i.realizado_acumulado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para bater a meta acumulada
      </p>
    )}

    <div className="mb-2">
      <small><strong>Atingimento acumulado:</strong> {Math.round((i.realizado_acumulado / i.meta_acumulada) * 100)}%</small>
      <div className="progress">
        <div
          className={`progress-bar bg-${i.realizado_acumulado / i.meta_acumulada >= 1 ? "info" : "secondary"}`}
          role="progressbar"
          style={{ width: `${Math.min(150, (i.realizado_acumulado / i.meta_acumulada) * 100)}%` }}
        >
          {Math.round((i.realizado_acumulado / i.meta_acumulada) * 100)}%
        </div>
      </div>
    </div>
  </>
)}

<button className="btn btn-sm btn-outline-success mt-2 ms-2" onClick={() => abrirModalHistorico(i)}>
  ➕ Registrar valor diário
</button>
  <button className="btn btn-sm btn-outline-dark mt-2" onClick={() => abrirModal(i)}>✏️ Editar</button>
  <button className="btn btn-sm btn-outline-danger mt-2 ms-2" onClick={() => excluirIndicador(i.id)}>🗑️ Excluir</button>
</div>


                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Indicador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Realizado Mensal</Form.Label>
              <Form.Control
                type="number"
                value={editMensal}
                onChange={(e) => setEditMensal(parseFloat(e.target.value))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Realizado Acumulado</Form.Label>
              <Form.Control
                type="number"
                value={editAcumulado}
                onChange={(e) => setEditAcumulado(parseFloat(e.target.value))}
              />
            </Form.Group>
          </Form>
          <h6 className="mt-4">Avançado</h6>
          <Form.Group className="mb-2">
  <Form.Label>Meta extra (% da meta mensal)</Form.Label>
  <Form.Control
    type="number"
    value={novoMetaExtra}
    onChange={(e) => setNovoMetaExtra(parseFloat(e.target.value))}
  />
</Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={salvarAlteracoes}>Salvar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNovo} onHide={() => setShowNovo(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Novo Indicador</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-2">
        <Form.Label>Nome</Form.Label>
        <Form.Control value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Grupo</Form.Label>
        <Form.Select value={novoGrupo} onChange={(e) => setNovoGrupo(e.target.value)}>
          <option value="">Selecione um grupo</option>
          {agrupadores.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Meta mensal</Form.Label>
        <Form.Control type="number" value={novoMetaMensal} onChange={(e) => setNovoMetaMensal(parseFloat(e.target.value))} />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Meta acumulada</Form.Label>
        <Form.Control type="number" value={novoMetaAcumulada} onChange={(e) => setNovoMetaAcumulada(parseFloat(e.target.value))} />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Realizado mensal</Form.Label>
        <Form.Control type="number" value={novoRealizadoMensal} onChange={(e) => setNovoRealizadoMensal(parseFloat(e.target.value))} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Realizado acumulado</Form.Label>
        <Form.Control type="number" value={novoRealizadoAcumulado} onChange={(e) => setNovoRealizadoAcumulado(parseFloat(e.target.value))} />
      </Form.Group>
    </Form>
    <h6 className="mt-4">Avançado</h6>
    <Form.Group className="mb-2">
  <Form.Label>Meta extra (% da meta mensal)</Form.Label>
  <Form.Control
    type="number"
    value={novoMetaExtra}
    onChange={(e) => setNovoMetaExtra(parseFloat(e.target.value))}
  />
</Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowNovo(false)}>Cancelar</Button>
    <Button
      variant="success"
      onClick={() => {
        axios.post("http://localhost:8000/indicadores", {
          nome: novoNome,
          agrupador: novoGrupo,
          meta_mensal: novoMetaMensal,
          meta_acumulada: novoMetaAcumulada,
          realizado_mensal: novoRealizadoMensal,
          realizado_acumulado: novoRealizadoAcumulado,
          meta_extra_porcentagem: novoMetaExtra

        }).then(() => {
          setShowNovo(false);
          buscarIndicadores();
          // limpar
          setNovoNome("");
          setNovoGrupo("");
          setNovoMetaMensal(0);
          setNovoMetaAcumulada(0);
          setNovoRealizadoMensal(0);
          setNovoRealizadoAcumulado(0);
        }).catch(() => alert("Erro ao criar indicador"));
      }}
    >
      Criar
    </Button>
  </Modal.Footer>
</Modal>

<Modal show={showHistorico} onHide={() => setShowHistorico(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Adicionar valor ao histórico</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group>
        <Form.Label>Valor</Form.Label>
        <Form.Control
          type="number"
          value={valorHistorico}
          onChange={(e) => setValorHistorico(parseFloat(e.target.value))}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowHistorico(false)}>Cancelar</Button>
    <Button
      variant="success"
      onClick={() => {
        if (!indicadorSelecionado) return;
        axios.post(`http://localhost:8000/historico/${indicadorSelecionado.id}`, {
          valor: valorHistorico
        }).then(() => {
          setShowHistorico(false);
          buscarIndicadores();
        }).catch(() => alert("Erro ao adicionar histórico"));
      }}
    >
      Adicionar
    </Button>
  </Modal.Footer>
</Modal>


    </div>
  );
};

export default Indicadores;
