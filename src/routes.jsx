import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute';
import Frame from './components/Frame';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import StockProduction from './pages/StockProduction';
import Produksi from './pages/Produksi';
import Overhaul from './pages/Overhaul';
import Rekayasa from './pages/Rekayasa';
import Kalibrasi from './pages/Kalibrasi';
import Inventory from './pages/Inventory';
import Personalia from './pages/Personalia';
import QualityControl from './pages/QualityControl';
import PageNotFound from './pages/PageNotFound';

const routes = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes with Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Frame />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="stockproduction" element={<StockProduction />} />
          <Route path="produksi" element={<Produksi />} />
          <Route path="overhaul" element={<Overhaul />} />
          <Route path="rekayasa" element={<Rekayasa />} />
          <Route path="kalibrasi" element={<Kalibrasi />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="qualitycontrol" element={<QualityControl />} />
          <Route path="personalia" element={<Personalia />} />
        </Route>
      </Route>

      {/* Optional Unauthorized Fallback */}
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

      {/* 404 Fallback */}
      <Route path="*" element={<PageNotFound />} />
    </>
  )
);

export default routes;