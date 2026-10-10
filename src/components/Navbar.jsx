import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Settings, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar() {
  const location = useLocation();
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo y título */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0071dc] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                WMRT <span className="text-[#0071dc]">Dispatch</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Ventanas de Despacho
              </span>
            </div>
          </Link>

          {/* Navegación y Acciones */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status backend badge */}
            <button
              type="button"
              onClick={checkApi}
              title="Click para re-comprobar conexión con la API en http://localhost:8080"
              className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                backendStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : backendStatus === 'checking'
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {backendStatus === 'connected' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : backendStatus === 'checking' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                  <span className="hidden sm:inline">Verificando</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="hidden sm:inline">Modo Demo</span>
                </>
              )}
            </button>

            {/* Enlace a Reserva (Página Principal) */}
            <Link
              to="/"
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-[#0071dc]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserva</span>
            </Link>

            {/* Botón de Settings (Página de Datos de Cliente) */}
            <Link
              to="/settings"
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all border ${
                location.pathname === '/settings'
                  ? 'bg-[#0071dc] text-white border-[#0071dc] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
              }`}
              title="Configurar datos de cliente y orden"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajustes</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
