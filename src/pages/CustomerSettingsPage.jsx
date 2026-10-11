import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Package, 
  CheckCircle, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../services/api';

const FALLBACK_ZONES = [
  { id: 1, name: 'Norte', region: 'RM Norte', coverageDescription: 'Comunas: Huechuraba, Quilicura, Recoleta, Independencia' },
  { id: 2, name: 'Centro / La Serena', region: 'Zona Central', coverageDescription: 'Comunas: Santiago, La Serena, Coquimbo, Providencia' },
  { id: 3, name: 'Sur', region: 'RM Sur', coverageDescription: 'Comunas: La Florida, Puente Alto, San Bernardo, Buin' },
  { id: 4, name: 'Oriente', region: 'RM Oriente', coverageDescription: 'Comunas: Las Condes, Vitacura, Lo Barnechea, La Reina' },
];

export default function CustomerSettingsPage() {
  const { customer, saveCustomer, generateNewOrderId } = useCustomer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: customer.customerName || 'Pedro Perez',
    address: customer.address || 'Monjitas, 2334, La Serena, Coquimbo',
    zoneId: customer.zoneId || '2',
    zoneName: customer.zoneName || 'La Serena',
    orderId: customer.orderId || 'ORD-2026-101',
  });

  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoadingZones(true);
    try {
      const data = await api.getZones();
      if (Array.isArray(data) && data.length > 0) {
        setZones(data);
        const found = data.find((z) => String(z.id) === String(formData.zoneId));
        if (found) {
          setFormData((prev) => ({ ...prev, zoneName: found.name }));
        } else {
          setFormData((prev) => ({
            ...prev,
            zoneId: String(data[0].id),
            zoneName: data[0].name,
          }));
        }
      } else {
        throw new Error('Lista de zonas vacía');
      }
    } catch (err) {
      setZones(FALLBACK_ZONES);
      const found = FALLBACK_ZONES.find((z) => String(z.id) === String(formData.zoneId));
      if (found) {
        setFormData((prev) => ({ ...prev, zoneName: found.name }));
      }
    } finally {
      setLoadingZones(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'zoneId') {
        const selectedZone = zones.find((z) => String(z.id) === String(value));
        if (selectedZone) {
          updated.zoneName = selectedZone.name;
        }
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setSavedSuccess(false);
  };

  const handleGenerateOrderId = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newOrderId = `ORD-2026-${randomSuffix}`;
    setFormData((prev) => ({ ...prev, orderId: newOrderId }));
    setSavedSuccess(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'El nombre es obligatorio.';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria.';
    if (!formData.zoneId) newErrors.zoneId = 'Debes seleccionar una zona de despacho.';
    if (!formData.orderId.trim()) newErrors.orderId = 'El ID de orden es obligatorio.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    saveCustomer(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const handleSaveAndGoToBooking = (e) => {
    e.preventDefault();
    if (!validate()) return;

    saveCustomer(formData);
    navigate('/');
  };

  const currentZone = zones.find((z) => String(z.id) === String(formData.zoneId));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-700 hover:text-[#0071dc] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a Reserva</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          ID: {formData.orderId}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Datos de Despacho del Cliente
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Campos requeridos por el servicio de reserva de despacho.
        </p>

        {/* Banner de éxito */}
        {savedSuccess && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2.5 text-xs animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Datos guardados correctamente.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Ej: Pedro Perez"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071dc] transition-all ${
                  errors.customerName ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.customerName && (
              <p className="text-xs text-rose-500 mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Dirección de Despacho *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ej: Monjitas, 2334, La Serena, Coquimbo"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071dc] transition-all ${
                  errors.address ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.address && (
              <p className="text-xs text-rose-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Zona de Despacho */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Zona de Despacho *
            </label>
            <select
              name="zoneId"
              value={formData.zoneId}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071dc] transition-all"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  Zona {zone.id}: {zone.name}
                </option>
              ))}
            </select>
            {currentZone?.coverageDescription && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                Cobertura: {currentZone.coverageDescription}
              </p>
            )}
          </div>

          {/* ID de Orden */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                ID de Orden *
              </label>
              <button
                type="button"
                onClick={handleGenerateOrderId}
                className="text-xs text-[#0071dc] hover:underline font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generar nuevo</span>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Package className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071dc]"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="w-full sm:w-1/2 py-3 px-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={handleSaveAndGoToBooking}
              className="w-full sm:w-1/2 py-3 px-4 rounded-full bg-[#0071dc] hover:bg-[#005cb8] text-white font-bold text-sm shadow-md transition-all"
            >
              Guardar y Volver a Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
