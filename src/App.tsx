// src/App.tsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Cardapio } from './pages/Cardapio';
import { Admin } from './pages/Admin';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Cardapio />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;