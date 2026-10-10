import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Settings, Calendar, User, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useCustomer } from '../context/CustomerContext';

export default function Navbar() {
  const location = useLocation();
  const { customer } = useCustomer();
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected', 'error', 'checking'

  const checkApi = async () => {
    setBackendStatus('checking');
    try {
      await api.getZones();
      setBackendStatus('connected');
    } catch (err) {
      setBackendStatus('error');
    }
  };

  useEffect(() => {
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block">
                  WMRT <span className="text-blue-600">Dispatch</span>
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:block">
                  Sistema de Reserva de Ventanas de Despacho
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación y Acciones */}
          <div className="flex items-center space-x-3">
            {/* Status backend badge */}
            <div
              onClick={checkApi}
              title="Click para re-comprobar conexión con la API en http://localhost:8080"
              className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                backendStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  : backendStatus === 'checking'
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              {backendStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden md:inline">API Conectada</span>
                </>
              ) : backendStatus === 'checking' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                  <span className="hidden md:inline">Verificando API...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden md:inline">API Offline (8080)</span>
                </>
              )}
            </div>

            {/* Enlace a Reserva (Página Principal) */}
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Despacho</span>
            </Link>

            {/* Botón de Settings (Página de Datos de Cliente) */}
            <Link
              to="/settings"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all border ${
                location.pathname === '/settings'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
              }`}
              title="Configurar datos de cliente y orden"
            >
              <Settings className="w-4 h-4" />
              <span>Settings Cliente</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
