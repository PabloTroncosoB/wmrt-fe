import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Package, 
  Phone, 
  Mail, 
  FileText, 
  Save, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../services/api';

const FALLBACK_ZONES = [
  { id: 1, name: 'Norte', region: 'RM Norte', coverageDescription: 'Comunas: Huechuraba, Quilicura, Recoleta, Independencia' },
  { id: 2, name: 'Centro', region: 'RM Centro', coverageDescription: 'Comunas: Santiago, Providencia, Nunoa, Macul' },
  { id: 3, name: 'Sur', region: 'RM Sur', coverageDescription: 'Comunas: La Florida, Puente Alto, San Bernardo, Buin' },
  { id: 4, name: 'Oriente', region: 'RM Oriente', coverageDescription: 'Comunas: Las Condes, Vitacura, Lo Barnechea, La Reina' },
];

export default function CustomerSettingsPage() {
  const { customer, saveCustomer, generateNewOrderId } = useCustomer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: customer.customerName || '',
    address: customer.address || '',
    zoneId: customer.zoneId || '2',
    zoneName: customer.zoneName || 'Centro',
    orderId: customer.orderId || 'ORD-2026-101',
    phone: customer.phone || '',
    email: customer.email || '',
    notes: customer.notes || '',
  });

  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zonesError, setZonesError] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoadingZones(true);
    setZonesError(null);
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
      console.warn('Error al obtener zonas de la API, usando fallback:', err);
      setZones(FALLBACK_ZONES);
      setZonesError(
        'No se pudo conectar con el backend (GET /api/v1/zones). Se cargaron zonas de referencia.'
      );
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Principal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Configuración de Cliente</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Configuración de Datos del Cliente
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Establece el cliente activo, la orden de compra y la zona de entrega que se utilizarán para reservar ventanas de despacho.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-sm"
          >
            <span>Ir a Reserva</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Banner de éxito */}
      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start space-x-3 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">¡Datos actualizados con éxito!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Los cambios han sido guardados en el almacenamiento local y están listos para la reserva de despacho.
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Información del Cliente y Orden</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nombre del Cliente */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nombre Completo <span className="text-rose-500">*</span>
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
                  placeholder="Ej: Juan Pérez"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    errors.customerName
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {errors.customerName && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customerName}</p>
              )}
            </div>

            {/* ID de Orden */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  ID de la Orden <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateOrderId}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
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
                  placeholder="Ej: ORD-001"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    errors.orderId
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {errors.orderId && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.orderId}</p>
              )}
            </div>

            {/* Dirección de entrega */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Dirección de Despacho <span className="text-rose-500">*</span>
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
                  placeholder="Ej: Av. Providencia 1234, Dpto 502"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                    errors.address
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400'
                  }`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.address}</p>
              )}
            </div>

            {/* Zona de despacho */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Zona Geográfica de Despacho <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={fetchZones}
                  disabled={loadingZones}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingZones ? 'animate-spin' : ''}`} />
                  <span>Recargar zonas</span>
                </button>
              </div>

              <select
                name="zoneId"
                value={formData.zoneId}
                onChange={handleInputChange}
                disabled={loadingZones}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all font-medium"
              >
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    Zona {zone.id}: {zone.name} ({zone.region})
                  </option>
                ))}
              </select>

              {/* Detalle de cobertura de la zona elegida */}
              {currentZone && (
                <div className="mt-2.5 p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start space-x-2 text-xs text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Comunas y Cobertura: </span>
                    <span className="text-blue-800">
                      {currentZone.coverageDescription || 'Toda la zona metropolitana'}
                    </span>
                  </div>
                </div>
              )}

              {zonesError && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{zonesError}</span>
                </p>
              )}
            </div>

            {/* Teléfono de contacto */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Teléfono de Contacto (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+56 9 1234 5678"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Email de contacto */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Correo Electrónico (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.cl"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Instrucciones especiales */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Instrucciones de Despacho (Opcional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ej: Dejar con conserje, portón color verde..."
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Guardar Datos</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndGoToBooking}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
            >
              <span>Guardar y Continuar a Reserva</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
