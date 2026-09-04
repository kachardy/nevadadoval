export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  imagem_url: string;
  disponivel: boolean;
}