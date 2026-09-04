import type { Produto } from '../types/Produto';
import abacateImg from '../assets/abacate.jpeg';
import morangoImg from '../assets/morango.jpeg';
import maracujaImg from '../assets/maracuja.jpeg';
import ovomaltineImg from '../assets/ovomaltine.jpeg';

const produtosIniciais: Produto[] = [
  { 
    id: "1", 
    nome: "Nevada de Abacate", 
    descricao: "O sabor clássico da praia. Água de coco geladíssima, polpa natural e leite condensado na medida certa.", 
    preco: 18.00, 
    precoPromocional: 14.99,
    imagem_url: abacateImg, 
    disponivel: true 
  },
  { 
    id: "2", 
    nome: "Nevada de Morango", 
    descricao: "Nossa nevada tradicional batida com pedaços frescos de morango e finalizada com calda.", 
    preco: 17.50, 
    imagem_url: morangoImg, 
    disponivel: true 
  },
  { 
    id: "3", 
    nome: "Nevada de Maracujá", 
    descricao: "O equilíbrio perfeito: o azedinho refrescante do maracujá com a cremosidade do leite condensado.", 
    preco: 16.00, 
    imagem_url: maracujaImg, 
    disponivel: true 
  },
  { 
    id: "4", 
    nome: "Nevada Ovomaltine", 
    descricao: "A queridinha gourmet! Leite Ninho batido na nevada e copo generosamente lambuzado com Nutella.", 
    preco: 22.50, 
    imagem_url: ovomaltineImg, 
    disponivel: true 
  }
];

if (!localStorage.getItem('@nevadas:produtos_v6')) {
  localStorage.setItem('@nevadas:produtos_v6', JSON.stringify(produtosIniciais));
}

if (!localStorage.getItem('@nevadas:pedidos')) {
  localStorage.setItem('@nevadas:pedidos', JSON.stringify([
    {
      id: "PED-9821",
      cliente: "Kauê Richardy",
      telefone: "(83) 99999-9999",
      senha: "123",
      endereco: "Rua Exemplo, 100 - Mangabeira",
      total: 35.00,
      status: "Saiu para Entrega",
      itens: [{ nome: "Nevada Tradicional", quantidade: 2 }]
    }
  ]));
}

export const getProdutos = async (): Promise<Produto[]> => {
  return JSON.parse(localStorage.getItem('@nevadas:produtos_v6') || '[]');
};

export const salvarProduto = async (produto: Produto): Promise<void> => {
  const dados = await getProdutos();
  localStorage.setItem('@nevadas:produtos_v6', JSON.stringify([produto, ...dados]));
};

export const atualizarProduto = async (produtoAtualizado: Produto): Promise<void> => {
  const dados = await getProdutos();
  const novaLista = dados.map(p => p.id === produtoAtualizado.id ? produtoAtualizado : p);
  localStorage.setItem('@nevadas:produtos_v6', JSON.stringify(novaLista));
};

export const excluirProduto = async (id: string): Promise<void> => {
  const dados = await getProdutos();
  localStorage.setItem('@nevadas:produtos_v6', JSON.stringify(dados.filter(p => p.id !== id)));
};

export const getPedidos = async (): Promise<any[]> => {
  return JSON.parse(localStorage.getItem('@nevadas:pedidos') || '[]');
};