import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Frame from './components/Frame';
import Dashboard from './pages/Dashboard';
import StockProduction from './pages/StockProduction';
import Produksi from './pages/Produksi';
import Overhaul from './pages/Overhaul';
import Rekayasa from './pages/Rekayasa';
import Kalibrasi from './pages/Kalibrasi';
import Inventory from './pages/Inventory';
import Personalia from './pages/Personalia';
import QualityControl from './pages/QualityControl';

function App() {
  return (
    <Router>
      <Frame>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/StockProduction" element={<StockProduction />} />
          <Route path="/Produksi" element={<Produksi />} />
          <Route path="/Rekayasa" element={<Rekayasa />} />
          <Route path="/Kalibrasi" element={<Kalibrasi />} />
          <Route path="/Inventory" element={<Inventory />} />
          <Route path="/QualityControl" element={<QualityControl />} />
          <Route path="/Personalia" element={<Personalia />} />
          <Route path="/Overhaul" element={<Overhaul />} />
        </Routes>
      </Frame>
    </Router>
  );
}

export default App;