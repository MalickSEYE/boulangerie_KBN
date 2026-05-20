import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login    from './pages/Login';
import Layout   from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import Ventes   from './pages/Ventes';
import NouvelleVente from './pages/NouvelleVente';
import Employes from './pages/Employes';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="produits" element={<Produits />} />
            <Route path="ventes"   element={<Ventes />} />
            <Route path="ventes/nouvelle" element={<NouvelleVente />} />
            <Route
              path="employes"
              element={
                <PrivateRoute adminOnly>
                  <Employes />
                </PrivateRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
