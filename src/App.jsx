import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import Navbar from './components/Navbar';
import ReservationPage from './pages/ReservationPage';
import CustomerSettingsPage from './pages/CustomerSettingsPage';

export default function App() {
  return (
    <CustomerProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-white md:bg-slate-100/70 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Página Principal: Selección de Ventana de Despacho y Resumen de Orden */}
              <Route path="/" element={<ReservationPage />} />
              {/* Página de Configuración: Setear datos de cliente */}
              <Route path="/settings" element={<CustomerSettingsPage />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="hidden sm:block bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>
                <strong>WMRT Dispatch</strong> &bull; Sistema de Reserva de Ventanas de Despacho
              </p>
              <p className="text-slate-400">
                API Spring Boot: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">localhost:8080</code>
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </CustomerProvider>
  );
}
