import { useEffect, useState } from 'react';
import type { Produto } from '../types/Produto';
import { getProdutos } from '../services/apiMock';

interface ItemCarrinho extends Produto { quantidade: number; }

const mockBairros = [
  { id: '1', nome: 'Mangabeira', taxa: 5.00 },
  { id: '2', nome: 'Tambaú', taxa: 7.00 },
  { id: '3', nome: 'Cabo Branco', taxa: 7.00 },
  { id: '4', nome: 'Ernesto Geisel', taxa: 8.00 },
  { id: '5', nome: 'Bayeux', taxa: 12.00 },
  { id: '6', nome: 'Santa Rita', taxa: 15.00 },
];

export function Cardapio() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  
  // Abas do Cliente: Mais Pedidos, Cardapio, Promocoes, MeusPedidos
  const [abaCliente, setAbaCliente] = useState<'mais-pedidos' | 'cardapio' | 'promocoes' | 'meus-pedidos'>('mais-pedidos');
  
  // Verificação de Horário de Funcionamento (9h às 23h)
  const [estaAberto, setEstaAberto] = useState(true);

  // Estados para consulta de Meus Pedidos
  const [telefoneBusca, setTelefoneBusca] = useState('');
  const [senhaBusca, setSenhaBusca] = useState('');
  const [pedidosEncontrados, setPedidosEncontrados] = useState<any[] | null>(null);

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [isCartAberto, setIsCartAberto] = useState(false);
  const [isCheckoutAberto, setIsCheckoutAberto] = useState(false);
  
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidadeDesejada, setQuantidadeDesejada] = useState(1);

  // Checkout states
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefoneCliente, setTelefoneCliente] = useState('');
  const [senhaCliente, setSenhaCliente] = useState('');
  const [cepCliente, setCepCliente] = useState('');
  const [ruaCliente, setRuaCliente] = useState('');
  const [numeroResidencia, setNumeroResidencia] = useState('');
  const [bairroSelecionado, setBairroSelecionado] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    getProdutos().then(setProdutos);

    // Validador do Horário (09:00 às 23:00)
    const verificarHorario = () => {
      const horaAtual = new Date().getHours();
      // Aberto se estiver entre 9h (inclusive) e 23h (exclusive)
      if (horaAtual >= 9 && horaAtual < 23) {
        setEstaAberto(true);
      } else {
        setEstaAberto(false);
      }
    };
    verificarHorario();
  }, []);

  const abrirModalProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setQuantidadeDesejada(1);
  };

  const adicionarAoCarrinho = () => {
    if (!estaAberto) {
      alert("No momento estamos fechados! Nosso horário de funcionamento é das 09h às 23h.");
      return;
    }
    if (!produtoSelecionado) return;
    const precoFinal = produtoSelecionado.precoPromocional || produtoSelecionado.preco;
    
    setCarrinho((carrinhoAtual) => {
      const itemExiste = carrinhoAtual.find((item) => item.id === produtoSelecionado.id);
      if (itemExiste) {
        return carrinhoAtual.map((item) =>
          item.id === produtoSelecionado.id ? { ...item, quantidade: item.quantidade + quantidadeDesejada } : item
        );
      }
      return [...carrinhoAtual, { ...produtoSelecionado, preco: precoFinal, quantidade: quantidadeDesejada }];
    });
    setProdutoSelecionado(null);
    setIsCartAberto(true);
  };

  const removerDoCarrinho = (produtoId: string) => setCarrinho(atual => atual.filter(i => i.id !== produtoId));
  const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const quantidadeItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const bairroEncontrado = mockBairros.find(b => b.id === bairroSelecionado);
  const valorFrete = bairroEncontrado ? bairroEncontrado.taxa : 0;
  const totalGeral = subtotal + valorFrete;

  // Filtragem dos produtos por aba e busca
  const produtosFiltrados = produtos.filter(p => {
    const passaBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    if (abaCliente === 'mais-pedidos') {
      return passaBusca && produtos.indexOf(p) < 4; // Primeiros 4 produtos como mais pedidos
    }
    if (abaCliente === 'promocoes') {
      return passaBusca && p.precoPromocional !== undefined;
    }
    return passaBusca;
  });

  const buscarMeusPedidos = (e: React.FormEvent) => {
    e.preventDefault();
    const todosPedidos = JSON.parse(localStorage.getItem('@nevadas:pedidos') || '[]');
    const meus = todosPedidos.filter((p: any) => p.telefone === telefoneBusca && p.senha === senhaBusca);
    setPedidosEncontrados(meus);
  };

  const handleBuscaCep = async (cep: string) => {
    setCepCliente(cep);
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setRuaCliente(data.logradouro);
          const bairroMatch = mockBairros.find(b => b.nome.toLowerCase() === data.bairro.toLowerCase());
          if (bairroMatch) setBairroSelecionado(bairroMatch.id);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const finalizarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estaAberto) return alert("Loja fechada no momento.");
    if (!bairroSelecionado) return alert("Selecione um bairro válido.");
    
    const pedidoGerado = {
      id: `PED-${Math.floor(Math.random() * 10000)}`,
      cliente: nomeCliente,
      telefone: telefoneCliente,
      senha: senhaCliente,
      endereco: `${ruaCliente}, ${numeroResidencia} - ${bairroEncontrado?.nome}`,
      total: totalGeral,
      status: "Em Preparo",
      itens: carrinho.map(i => ({ nome: i.nome, quantidade: i.quantidade }))
    };

    const pedidosAntigos = JSON.parse(localStorage.getItem('@nevadas:pedidos') || '[]');
    localStorage.setItem('@nevadas:pedidos', JSON.stringify([pedidoGerado, ...pedidosAntigos]));

    alert("Pedido realizado com sucesso!");
    setCarrinho([]); setIsCheckoutAberto(false); setNomeCliente(''); setTelefoneCliente('');
    setSenhaCliente(''); setCepCliente(''); setRuaCliente(''); setNumeroResidencia(''); setBairroSelecionado('');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      
      {/* 1. Navbar Oficial Responsiva */}
      <nav className="navbar navbar-dark bg-marca sticky-top shadow-sm py-2" style={{ zIndex: 1020 }}>
        <div className="container d-flex justify-content-between align-items-center">
          
          {/* Logo da Loja (Igual para ambos) */}
          <a className="navbar-brand m-0" href="#">
            <img src="/logo.jpeg" alt="Nevada do Val" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
          </a>
          
          {/* VERSÃO DESKTOP (Aparece apenas em telas médias e grandes) */}
          <div className="d-none d-md-flex align-items-center gap-4">
            <span className={`badge rounded-pill px-3 py-2 fw-bold text-white d-flex align-items-center ${estaAberto ? 'bg-success' : 'bg-danger'}`}>
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }}></i> 
              {estaAberto ? 'Aberto (09h - 23h)' : 'Fechado'}
            </span>

            <button className="btn btn-outline-light position-relative border-0 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px' }} onClick={() => setIsCartAberto(true)}>
              <i className="bi bi-bag-fill fs-5"></i>
              {quantidadeItens > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                  {quantidadeItens}
                </span>
              )}
            </button>
          </div>

          {/* VERSÃO MOBILE (Aparece apenas em celulares) */}
          <div className="d-flex d-md-none align-items-center gap-2">
            <button className="btn btn-outline-light position-relative border-0 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '42px', height: '42px' }} onClick={() => setIsCartAberto(true)}>
              <i className="bi bi-bag-fill fs-6"></i>
              {quantidadeItens > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                  {quantidadeItens}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Linha inferior extra para o status no mobile (mantém o topo limpo) */}
        <div className="container d-flex d-md-none justify-content-center pt-2 border-top border-secondary border-opacity-25 mt-2">
          <span className={`badge rounded-pill px-3 py-1 fw-bold text-white d-flex align-items-center ${estaAberto ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.8rem' }}>
            <i className="bi bi-circle-fill me-1" style={{ fontSize: '6px' }}></i> 
            {estaAberto ? 'Aberto (09h - 23h)' : 'Fechado'}
          </span>
        </div>
      </nav>

      {/* 2. Hero Section Original com Blur e Imagem amarela da Nevada */}
      <section className="position-relative py-5 overflow-hidden" style={{ backgroundColor: 'var(--cor-primaria)' }}>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundImage: 'url(https://placehold.co/1920x1080/063326/0a4f3b?text=Textura)', backgroundSize: 'cover', opacity: 0.6, filter: 'blur(15px)', transform: 'scale(1.1)' }}></div>
        <div className="container position-relative text-white py-4" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
              <span className="badge text-marca mb-3 px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: 'var(--cor-secundaria)' }}>100% Natural e Refrescante</span>
              <h1 className="display-4 fw-bold mb-3 text-shadow">O que é a Nevada?</h1>
              <p className="opacity-90 lead" style={{ lineHeight: '1.6' }}>
                Nascida para refrescar o seu dia. Misturamos <strong>água de coco puríssima, polpa fresca da fruta, muito gelo e leite condensado</strong>, batidos até atingir uma cremosidade surreal.
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <div className="position-relative d-inline-block">
                <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-warning opacity-25" style={{ width: '320px', height: '320px', filter: 'blur(35px)' }}></div>
                <img 
                  src="/maracuja.jpeg" 
                  alt="Copo de Nevada" 
                  className="img-fluid rounded-4 shadow-lg position-relative" 
                  style={{ transform: 'rotate(3deg)', border: '5px solid white', maxWidth: '280px', objectFit: 'cover' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Abas de Navegação do Cliente */}
      <main className="container flex-grow-1 py-5">
        <ul className="nav nav-pills justify-content-center mb-5 gap-2 gap-md-3">
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 fw-bold ${abaCliente === 'mais-pedidos' ? 'active shadow-sm' : 'bg-light text-muted'}`} style={abaCliente === 'mais-pedidos' ? { backgroundColor: 'var(--cor-secundaria)', color: 'var(--cor-texto-botao)' } : {}} onClick={() => setAbaCliente('mais-pedidos')}>
              <i className="bi bi-star-fill me-2"></i> Mais Pedidos
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 fw-bold ${abaCliente === 'cardapio' ? 'active shadow-sm' : 'bg-light text-muted'}`} style={abaCliente === 'cardapio' ? { backgroundColor: 'var(--cor-primaria)', color: '#fff' } : {}} onClick={() => setAbaCliente('cardapio')}>
              <i className="bi bi-grid me-2"></i> Cardápio
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 fw-bold ${abaCliente === 'promocoes' ? 'active shadow-sm' : 'bg-light text-muted'}`} style={abaCliente === 'promocoes' ? { backgroundColor: '#dc3545', color: '#fff' } : {}} onClick={() => setAbaCliente('promocoes')}>
              <i className="bi bi-tag-fill me-2"></i> Promoções 🔥
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 fw-bold ${abaCliente === 'meus-pedidos' ? 'active shadow-sm' : 'bg-light text-muted'}`} style={abaCliente === 'meus-pedidos' ? { backgroundColor: '#495057', color: '#fff' } : {}} onClick={() => setAbaCliente('meus-pedidos')}>
              <i className="bi bi-clock-history me-2"></i> Meus Pedidos
            </button>
          </li>
        </ul>

        {/* AVISO DE LOJA FECHADA */}
        {!estaAberto && (
          <div className="alert alert-warning text-center fw-bold py-3 mb-4 rounded-4 shadow-sm">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Estamos fechados no momento. Nosso horário de atendimento é das 09:00 às 23:00. Você pode navegar pelo cardápio, mas os pedidos estarão disponíveis na abertura!
          </div>
        )}

        {/* TELA DE PEDIDOS */}
        {abaCliente === 'meus-pedidos' ? (
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 rounded-4">
                <h4 className="fw-bold text-marca mb-3"><i className="bi bi-search me-2"></i> Acompanhar Pedido</h4>
                <p className="text-muted small">Informe seu WhatsApp e a senha cadastrada para ver o andamento.</p>
                <form onSubmit={buscarMeusPedidos}>
                  <div className="mb-3"><label className="form-label small fw-bold">WhatsApp</label><input type="tel" className="form-control" required value={telefoneBusca} onChange={e => setTelefoneBusca(e.target.value)} /></div>
                  <div className="mb-3"><label className="form-label small fw-bold">Senha</label><input type="password" className="form-control" required value={senhaBusca} onChange={e => setSenhaBusca(e.target.value)} /></div>
                  <button type="submit" className="btn btn-marca w-100 py-2 fw-bold rounded-pill">Consultar Pedidos</button>
                </form>

                {pedidosEncontrados !== null && (
                  <div className="mt-4">
                    <hr />
                    {pedidosEncontrados.length === 0 ? (
                      <p className="text-center text-muted">Nenhum pedido encontrado com esses dados.</p>
                    ) : (
                      pedidosEncontrados.map(ped => (
                        <div key={ped.id} className="bg-light p-3 rounded-3 mb-3">
                          <div className="d-flex justify-content-between mb-2"><strong>{ped.id}</strong><span className="badge bg-success">{ped.status}</span></div>
                          <p className="small mb-1 text-muted">{ped.endereco}</p>
                          <ul className="list-unstyled small mb-0">
                            {ped.itens.map((i: any, idx: number) => <li key={idx}>• {i.quantidade}x {i.nome}</li>)}
                          </ul>
                          <div className="text-end fw-bold text-marca mt-2">R$ {ped.total.toFixed(2)}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* TELA DE PRODUTOS */
          <>
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-md-8">
                <div className="input-group shadow-sm rounded-pill bg-white overflow-hidden p-1">
                  <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
                  <input type="text" className="form-control border-0 py-2 shadow-none" placeholder="Buscar sabor..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="row g-4">
              {produtosFiltrados.map((produto) => (
                <div key={produto.id} className="col-12 col-sm-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm produto-card position-relative" style={{ cursor: 'pointer' }} onClick={() => abrirModalProduto(produto)}>
                    
                    {produto.precoPromocional && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-3 p-2 shadow-sm fs-6 z-2">
                        PROMOÇÃO 🔥
                      </span>
                    )}

                    {!produto.disponivel && <span className="badge bg-secondary position-absolute top-0 end-0 m-3 p-2">Esgotado</span>}
                    
                    <img src={produto.imagem_url} alt={produto.nome} className="card-img-top produto-img" style={{ opacity: produto.disponivel ? 1 : 0.5 }} />
                    
                    <div className="card-body p-4 d-flex flex-column">
                      <h5 className="fw-bold text-marca">{produto.nome}</h5>
                      <p className="text-muted small mb-4">{produto.descricao.substring(0, 60)}...</p>
                      
                      <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
                        <div>
                          {produto.precoPromocional ? (
                            <div>
                              <span className="text-decoration-line-through text-muted small d-block">R$ {produto.preco.toFixed(2)}</span>
                              <span className="fs-5 fw-bold text-success">R$ {produto.precoPromocional.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="fs-5 fw-bold text-marca">R$ {produto.preco.toFixed(2)}</span>
                          )}
                        </div>
                        <span className="text-marca"><i className="bi bi-plus-circle fs-3"></i></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-marca text-white pt-5 pb-3 mt-auto shadow-lg">
        <div className="container">
          <div className="row align-items-center text-center text-md-start">
            <div className="col-md-6 mb-4 mb-md-0">
              <h4 className="fw-bold mb-3">Nevada do Val</h4>
              <p className="text-white-50 mb-1"><i className="bi bi-geo-alt-fill me-2"></i> João Pessoa - PB</p>
              <p className="text-white-50"><i className="bi bi-clock-fill me-2"></i> Aberto todos os dias, das 09h às 23h</p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="https://instagram.com/nevadadoval" target="_blank" rel="noreferrer" className="btn btn-outline-light rounded-pill px-4 py-2">
                <i className="bi bi-instagram me-2"></i> Siga nosso Instagram
              </a>
            </div>
          </div>
          <hr className="border-secondary opacity-25 mt-4" />
          <div className="text-center text-white-50 small">&copy; {new Date().getFullYear()} Nevada do Val. Todos os direitos reservados.</div>
        </div>
      </footer>

      {/* Modal de Detalhes do Produto */}
      {produtoSelecionado && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
              <div className="position-relative">
                <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} className="w-100" style={{ height: '250px', objectFit: 'cover' }} />
                <button className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle shadow" onClick={() => setProdutoSelecionado(null)}><i className="bi bi-x-lg"></i></button>
              </div>
              <div className="p-4">
                <h3 className="fw-bold text-marca">{produtoSelecionado.nome}</h3>
                <p className="text-muted">{produtoSelecionado.descricao}</p>
                <div className="bg-light p-3 rounded-4 d-flex justify-content-between align-items-center mb-4">
                  <div>
                    {produtoSelecionado.precoPromocional ? (
                      <div>
                        <span className="text-decoration-line-through text-muted small">R$ {(produtoSelecionado.preco * quantidadeDesejada).toFixed(2)}</span>
                        <span className="fw-bold fs-4 text-success d-block">R$ {(produtoSelecionado.precoPromocional * quantidadeDesejada).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="fw-bold fs-4 text-marca">R$ {(produtoSelecionado.preco * quantidadeDesejada).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center border rounded-pill bg-white px-2 py-1 shadow-sm">
                    <button className="btn btn-sm btn-link text-dark text-decoration-none" onClick={() => setQuantidadeDesejada(Math.max(1, quantidadeDesejada - 1))}><i className="bi bi-dash fs-5"></i></button>
                    <span className="mx-3 fw-bold fs-5">{quantidadeDesejada}</span>
                    <button className="btn btn-sm btn-link text-dark text-decoration-none" onClick={() => setQuantidadeDesejada(quantidadeDesejada + 1)}><i className="bi bi-plus fs-5"></i></button>
                  </div>
                </div>
                <button className="btn btn-marca w-100 py-3 rounded-pill fw-bold fs-5 shadow" disabled={!produtoSelecionado.disponivel || !estaAberto} onClick={adicionarAoCarrinho}>
                  {!estaAberto ? 'Loja Fechada' : produtoSelecionado.disponivel ? 'Adicionar à Sacola' : 'Produto Esgotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offcanvas Carrinho */}
      <div className={`offcanvas offcanvas-end shadow ${isCartAberto ? 'show' : ''}`} style={{ visibility: isCartAberto ? 'visible' : 'hidden', zIndex: 1060 }}>
        <div className="offcanvas-header bg-marca text-white">
          <h5 className="fw-bold m-0"><i className="bi bi-bag-check me-2"></i> Sua Sacola</h5>
          <button className="btn-close btn-close-white" onClick={() => setIsCartAberto(false)}></button>
        </div>
        
        <div className="offcanvas-body p-0 d-flex flex-column bg-light">
          {carrinho.length === 0 ? (
            /* Aviso amigável quando a sacola está vazia */
            <div className="text-center p-5 my-auto">
              <div className="bg-white rounded-circle p-4 d-inline-flex shadow-sm mb-3 text-marca">
                <i className="bi bi-cup-straw fs-1"></i>
              </div>
              <h5 className="fw-bold text-marca mb-2">Sua sacola está vazia!</h5>
              <p className="text-muted small mb-4">
                Que tal se refrescar agora? Escolha uma nevada deliciosa em nosso cardápio e adicione à sua sacola.
              </p>
              <button 
                className="btn btn-marca rounded-pill px-4 py-2 fw-bold shadow-sm"
                onClick={() => setIsCartAberto(false)}
              >
                Escolher uma Nevada!
              </button>
            </div>
          ) : (
            /* Lista de itens na sacola */
            <>
              <div className="flex-grow-1 p-3 overflow-auto">
                {carrinho.map(item => (
                  <div key={item.id} className="d-flex mb-3 bg-white p-3 rounded-4 shadow-sm align-items-center">
                    <span className="badge bg-marca rounded-pill px-3 py-2 me-3">{item.quantidade}x</span>
                    <div className="flex-grow-1">
                      <h6 className="m-0 fw-bold text-marca">{item.nome}</h6>
                      <small className="text-muted">R$ {item.preco.toFixed(2)}</small>
                    </div>
                    <button className="btn btn-link text-danger p-0" onClick={() => removerDoCarrinho(item.id)}>
                      <i className="bi bi-trash fs-5"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-white border-top shadow-lg">
                <h4 className="d-flex justify-content-between mb-4 fw-bold text-marca">
                  <span>Total:</span> 
                  <span>R$ {subtotal.toFixed(2)}</span>
                </h4>
                <button 
                  className="btn btn-marca w-100 py-3 rounded-pill fw-bold fs-5 shadow-sm" 
                  disabled={!estaAberto} 
                  onClick={() => { setIsCartAberto(false); setIsCheckoutAberto(true); }}
                >
                  {estaAberto ? 'Avançar para Entrega' : 'Loja Fechada'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Checkout */}
      {isCheckoutAberto && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1070, overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg my-5">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header bg-marca text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-person-lines-fill me-2"></i> Finalizar Pedido</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsCheckoutAberto(false)}></button>
              </div>
              <div className="modal-body p-4 p-md-5">
                <form id="formCheckout" onSubmit={finalizarPedido}>
                  <div className="row g-3">
                    <div className="col-12"><h6 className="fw-bold text-marca border-bottom pb-2">1. Seus Dados</h6></div>
                    <div className="col-md-12"><label className="form-label small fw-bold">Nome Completo</label><input type="text" className="form-control" required value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">WhatsApp</label><input type="tel" className="form-control" required value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Senha de Acesso</label><input type="password" className="form-control" required value={senhaCliente} onChange={e => setSenhaCliente(e.target.value)} /></div>

                    <div className="col-12 mt-4"><h6 className="fw-bold text-marca border-bottom pb-2">2. Entrega</h6></div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">CEP</label>
                      <input type="text" className="form-control" required maxLength={9} value={cepCliente} onChange={e => handleBuscaCep(e.target.value)} />
                      {buscandoCep && <small className="text-primary">Buscando...</small>}
                    </div>
                    <div className="col-md-8"><label className="form-label small fw-bold">Rua</label><input type="text" className="form-control" required value={ruaCliente} onChange={e => setRuaCliente(e.target.value)} /></div>
                    <div className="col-md-4"><label className="form-label small fw-bold">Número</label><input type="text" className="form-control" required value={numeroResidencia} onChange={e => setNumeroResidencia(e.target.value)} /></div>
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">Bairro</label>
                      <select className="form-select" required value={bairroSelecionado} onChange={e => setBairroSelecionado(e.target.value)}>
                        <option value="">Selecione...</option>
                        {mockBairros.map(b => <option key={b.id} value={b.id}>{b.nome} - R$ {b.taxa.toFixed(2)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-light p-4 rounded-4 mt-4">
                    <div className="d-flex justify-content-between mb-2 text-muted"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
                    <div className="d-flex justify-content-between mb-2 text-danger"><span>Frete:</span><span>+ R$ {valorFrete.toFixed(2)}</span></div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center"><span className="fw-bold fs-5">Total:</span><span className="fw-bold fs-3 text-marca">R$ {totalGeral.toFixed(2)}</span></div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="submit" form="formCheckout" className="btn btn-marca w-100 py-3 fw-bold rounded-pill fs-5">
                  Confirmar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}