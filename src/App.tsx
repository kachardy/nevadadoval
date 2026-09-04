// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Cardapio } from './pages/Cardapio';
import { Admin } from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz: O que o cliente vê ao acessar o domínio principal */}
        <Route path="/" element={<Cardapio />} />
        
        {/* Rota protegida: Onde o dono da loja vai gerenciar o sistema */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;