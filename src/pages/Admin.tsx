// src/pages/Admin.tsx
import { useState, useEffect } from 'react';
import type { Produto } from '../types/Produto';
import { getProdutos, salvarProduto, atualizarProduto, excluirProduto, getPedidos } from '../services/apiMock';

export function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'cardapio' | 'pedidos'>('cardapio');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  const carregarDados = async () => {
    setProdutos(await getProdutos());
    setPedidos(await getPedidos());
  };

  useEffect(() => {
    if (autenticado) carregarDados();
  }, [autenticado]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === 'admin' && senha === 'admin123') {
      setAutenticado(true);
    } else {
      alert('Credenciais incorretas! Use: admin / admin123');
    }
  };

  const handleUploadFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagemPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const limparFormulario = () => {
    setIdEditando(null); setNome(''); setDescricao(''); setPreco(''); setPrecoPromocional(''); setImagemPreview(null);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagemPreview) return alert("Adicione uma foto para a nevada.");

    const produtoData: Produto = {
      id: idEditando || crypto.randomUUID(),
      nome, 
      descricao, 
      preco: parseFloat(preco.toString().replace(',', '.')), 
      precoPromocional: precoPromocional ? parseFloat(precoPromocional.toString().replace(',', '.')) : undefined,
      imagem_url: imagemPreview, 
      disponivel: true
    };

    if (idEditando) {
      await atualizarProduto(produtoData);
      alert("Produto atualizado com sucesso!");
    } else {
      await salvarProduto(produtoData);
      alert("Produto cadastrado com sucesso!");
    }
    limparFormulario();
    carregarDados();
  };

  const iniciarEdicao = (p: Produto) => {
    setIdEditando(p.id); 
    setNome(p.nome); 
    setDescricao(p.descricao); 
    setPreco(p.preco.toString()); 
    setPrecoPromocional(p.precoPromocional ? p.precoPromocional.toString() : ''); 
    setImagemPreview(p.imagem_url);
    window.scrollTo(0, 0);
  };

  const handleExcluir = async (id: string, nomeProd: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${nomeProd}"?`)) {
      await excluirProduto(id);
      carregarDados();
    }
  };

  // TELA DE LOGIN DO ADMIN
  if (!autenticado) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--cor-fundo)' }}>
        <div className="card shadow-lg border-0 p-5 rounded-4" style={{ width: '100%', maxWidth: '420px' }}>
          <div className="text-center mb-4">
            <div className="bg-marca text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
              <i className="bi bi-shield-lock-fill fs-2"></i>
            </div>
            <h3 className="fw-bold text-marca">Painel Administrativo</h3>
            <p className="text-muted small">Nevada do Val - Gestão Interna</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Usuário</label>
              <input 
                type="text" 
                className="form-control py-2 shadow-none" 
                placeholder="Ex: admin" 
                value={usuario} 
                onChange={e => setUsuario(e.target.value)} 
                required 
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Senha</label>
              <input 
                type="password" 
                className="form-control py-2 shadow-none" 
                placeholder="••••••••" 
                value={senha} 
                onChange={e => setSenha(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-marca w-100 py-3 fw-bold rounded-pill shadow-sm">
              Entrar no Sistema
            </button>
          </form>
          
          <div className="text-center mt-4">
            <a href="/" className="text-muted small text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i> Voltar para o Cardápio do Cliente
            </a>
          </div>
        </div>
      </div>
    );
  }

  // TELA DO PAINEL APÓS O LOGIN
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-marca fw-bold mb-0">Gestão Nevada do Val</h2>
          <p className="text-muted small mb-0">Controle de cardápio e acompanhamento de pedidos</p>
        </div>
        <div className="d-flex gap-2">
          <a href="/" className="btn btn-outline-secondary rounded-pill px-3">Ver Site</a>
          <button className="btn btn-outline-danger rounded-pill px-4" onClick={() => setAutenticado(false)}>Sair</button>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-bold ${abaAtiva === 'cardapio' ? 'active text-white' : 'bg-light text-muted'}`} style={abaAtiva === 'cardapio' ? { backgroundColor: 'var(--cor-primaria)' } : {}} onClick={() => setAbaAtiva('cardapio')}>
            <i className="bi bi-grid me-2"></i> Gestão do Cardápio
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-pill px-4 fw-bold ${abaAtiva === 'pedidos' ? 'active text-white' : 'bg-light text-muted'}`} style={abaAtiva === 'pedidos' ? { backgroundColor: 'var(--cor-primaria)' } : {}} onClick={() => setAbaAtiva('pedidos')}>
            <i className="bi bi-bag-check me-2"></i> Pedidos Recebidos
          </button>
        </li>
      </ul>

      {abaAtiva === 'cardapio' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 sticky-top rounded-4" style={{ top: '20px' }}>
              <h5 className="fw-bold mb-3 text-marca">{idEditando ? '✏️ Editar Produto' : '➕ Novo Produto'}</h5>
              <form onSubmit={handleSalvar}>
                <div className="mb-2"><label className="form-label small fw-bold">Nome</label><input type="text" className="form-control" value={nome} onChange={e => setNome(e.target.value)} required /></div>
                <div className="row">
                  <div className="col-6 mb-2"><label className="form-label small fw-bold">Preço Normal (R$)</label><input type="number" step="0.01" className="form-control" value={preco} onChange={e => setPreco(e.target.value)} required /></div>
                  <div className="col-6 mb-2"><label className="form-label small fw-bold">Promo (Opcional)</label><input type="number" step="0.01" className="form-control" placeholder="14.99" value={precoPromocional} onChange={e => setPrecoPromocional(e.target.value)} /></div>
                </div>
                <div className="mb-2"><label className="form-label small fw-bold">Descrição</label><textarea className="form-control" rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} required></textarea></div>
                
                <div className="border rounded-3 d-flex justify-content-center align-items-center position-relative bg-light mb-3" style={{ height: '120px', overflow: 'hidden' }}>
                  {imagemPreview ? <img src={imagemPreview} alt="Preview" className="w-100 h-100 object-fit-cover" /> : <span className="small text-muted"><i className="bi bi-camera me-1"></i> Foto do Produto</span>}
                  <input type="file" accept="image/*" className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: 'pointer' }} onChange={handleUploadFoto} />
                </div>
                
                <button type="submit" className="btn btn-marca w-100 fw-bold py-2 rounded-pill">{idEditando ? 'Salvar Alterações' : 'Cadastrar Produto'}</button>
                {idEditando && <button type="button" className="btn btn-light w-100 mt-2 rounded-pill" onClick={limparFormulario}>Cancelar</button>}
              </form>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h5 className="fw-bold mb-3 text-marca">Cardápio Atual</h5>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead><tr><th>Foto</th><th>Produto</th><th>Preços</th><th className="text-end">Ações</th></tr></thead>
                  <tbody>
                    {produtos.map(p => (
                      <tr key={p.id}>
                        <td><img src={p.imagem_url} alt={p.nome} className="rounded-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} /></td>
                        <td>
                          <strong>{p.nome}</strong> {p.precoPromocional && <span className="badge bg-danger ms-1">Promo</span>}
                          <br/><small className="text-muted">{p.descricao.substring(0, 35)}...</small>
                        </td>
                        <td>
                          {p.precoPromocional ? (
                            <>
                              <span className="text-decoration-line-through text-muted small me-2">R$ {p.preco.toFixed(2)}</span>
                              <strong className="text-success">R$ {p.precoPromocional.toFixed(2)}</strong>
                            </>
                          ) : (
                            <span>R$ {p.preco.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-primary me-2 rounded-circle" onClick={() => iniciarEdicao(p)}><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleExcluir(p.id, p.nome)}><i className="bi bi-trash"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'pedidos' && (
        <div className="row g-4">
          {pedidos.map(ped => (
            <div key={ped.id} className="col-md-6">
              <div className="card border-0 shadow-sm p-4 rounded-4">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <h5 className="fw-bold text-marca">{ped.id}</h5>
                  <span className="badge bg-warning text-dark">{ped.status}</span>
                </div>
                <p className="mb-1"><strong>Cliente:</strong> {ped.cliente} - {ped.telefone}</p>
                <p className="mb-3 small text-muted"><i className="bi bi-geo-alt"></i> {ped.endereco}</p>
                <ul className="list-unstyled bg-light p-3 rounded-3">
                  {ped.itens.map((i: any, index: number) => (
                    <li key={index} className="mb-1 border-bottom pb-1">• <strong>{i.quantidade}x</strong> {i.nome}</li>
                  ))}
                  <li className="text-end fw-bold text-marca mt-2 fs-5">Total: R$ {ped.total.toFixed(2)}</li>
                </ul>
              </div>
            </div>
          ))}
          {pedidos.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              <h5>Nenhum pedido recebido ainda.</h5>
            </div>
          )}
        </div>
      )}
    </div>
  );
}