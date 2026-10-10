import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Package,
  Settings,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Tag,
  Check,
  ChevronRight,
  ShieldCheck,
  CalendarCheck,
  Truck,
  Trash2,
  ExternalLink,
  Info,
  DollarSign
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { api, ApiError } from '../services/api';

export default function ReservationPage() {
  const { customer, generateNewOrderId } = useCustomer();

  // Estados de datos
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Estados de carga y error
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState(null);
  const [blockError, setBlockError] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Estado de éxito / comprobante
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Reservas existentes de la orden
  const [existingReservations, setExistingReservations] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);

  // Cargar fechas disponibles cuando cambia la zona del cliente
  useEffect(() => {
    if (customer.zoneId) {
      fetchDates(customer.zoneId);
    }
    if (customer.orderId) {
      fetchExistingReservations(customer.orderId);
    }
  }, [customer.zoneId, customer.orderId]);

  // Cargar bloques cuando se selecciona una fecha
  useEffect(() => {
    if (customer.zoneId && selectedDate) {
      fetchBlocks(customer.zoneId, selectedDate);
    } else {
      setTimeBlocks([]);
      setSelectedBlock(null);
    }
  }, [customer.zoneId, selectedDate]);

  // Consulta de fechas disponibles
  const fetchDates = async (zoneId) => {
    setLoadingDates(true);
    setDateError(null);
    try {
      const dates = await api.getAvailableDates(zoneId);
      setAvailableDates(dates || []);

      if (dates && dates.length > 0) {
        // Seleccionar automáticamente la primera fecha disponible
        setSelectedDate(dates[0].date);
      } else {
        setSelectedDate('');
      }
    } catch (err) {
      console.error('Error fetching available dates:', err);
      setDateError(err.message || 'No fue posible cargar las fechas disponibles');
      setAvailableDates([]);
      setSelectedDate('');
    } finally {
      setLoadingDates(false);
    }
  };

  // Consulta de bloques horarios para la fecha
  const fetchBlocks = async (zoneId, date) => {
    setLoadingBlocks(true);
    setBlockError(null);
    setSelectedBlock(null);
    try {
      const blocks = await api.getTimeBlocks(zoneId, date);
      setTimeBlocks(blocks || []);
    } catch (err) {
      console.error('Error fetching time blocks:', err);
      setBlockError(err.message || 'No fue posible cargar los bloques horarios para esta fecha');
      setTimeBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
  };

  // Consulta de reservas existentes para esta orden
  const fetchExistingReservations = async (orderId) => {
    setLoadingExisting(true);
    try {
      const reservation = await api.getReservationByOrderId(orderId);
      if (reservation && reservation.id) {
        setExistingReservations([reservation]);
      } else {
        setExistingReservations([]);
      }
    } catch (err) {
      // Si retorna 404 significa que la orden aún no tiene reserva
      setExistingReservations([]);
    } finally {
      setLoadingExisting(false);
    }
  };

  // Confirmar reserva
  const handleConfirmReservation = async () => {
    if (!selectedBlock) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const payload = {
        orderId: customer.orderId,
        timeBlockId: selectedBlock.id,
        customerName: customer.customerName,
        address: customer.address,
      };

      const result = await api.createReservation(payload);
      setConfirmedReservation(result);

      // Refrescar bloques y fechas
      await fetchBlocks(customer.zoneId, selectedDate);
      await fetchDates(customer.zoneId);
      await fetchExistingReservations(customer.orderId);
    } catch (err) {
      console.error('Error creating reservation:', err);
      setBookingError(
        err.message || 'Ocurrió un error al confirmar la reserva. Por favor intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar reserva existente
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva de despacho?')) return;

    setCancellingId(reservationId);
    setCancelMessage(null);
    try {
      await api.cancelReservation(reservationId);
      setCancelMessage('Reserva cancelada con éxito. El cupo de despacho ha sido liberado.');
      setConfirmedReservation(null);

      // Refrescar bloques y fechas
      if (selectedDate) {
        await fetchBlocks(customer.zoneId, selectedDate);
      }
      await fetchDates(customer.zoneId);
      await fetchExistingReservations(customer.orderId);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert(`Error al cancelar reserva: ${err.message}`);
    } finally {
      setCancellingId(null);
      setTimeout(() => setCancelMessage(null), 5000);
    }
  };

  // Formateador de moneda en pesos chilenos
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return `$${amount}`;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formateador de fechas legible
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-CL', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TARJETA RESUMEN DE ORDEN Y CLIENTE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-300">Orden Activa</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-mono font-bold">
                  {customer.orderId || 'SIN ORDEN'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Datos de Despacho del Cliente
              </h2>
            </div>
          </div>

          <Link
            to="/settings"
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/10 shadow-sm self-start sm:self-auto"
            title="Ir a modificar datos de cliente"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Editar Datos de Cliente</span>
          </Link>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50/50">
          {/* Cliente */}
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{customer.customerName || 'No definido'}</p>
              {customer.phone && <p className="text-xs text-slate-500">{customer.phone}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dirección de Entrega</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">{customer.address || 'No definida'}</p>
            </div>
          </div>

          {/* Zona */}
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Zona Geográfica</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                  Zona #{customer.zoneId || '2'}
                </span>
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {customer.zoneName || 'Santiago Centro'}
                </span>
              </div>
            </div>
          </div>

          {/* Estado de Reserva Actual */}
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${existingReservations.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estado de Reserva</p>
              {existingReservations.length > 0 ? (
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Tiene Reserva ({existingReservations[0].status})
                  </span>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-600 mt-0.5">Sin reserva agendada</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de cancelación */}
      {cancelMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium">{cancelMessage}</span>
          </div>
        </div>
      )}

      {/* 2. COMPROBANTE DE RESERVA CONFIRMADA (MODAL / HERO CARD) */}
      {confirmedReservation && (
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-2xl text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10 border border-emerald-400/30 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-400/30">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-1 rounded-full bg-white/25 text-emerald-50 text-xs font-bold uppercase tracking-wider">
                  ¡Reserva Confirmada Exitosamente!
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Ticket de Despacho #{confirmedReservation.id}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  generateNewOrderId();
                  setConfirmedReservation(null);
                }}
                className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Crear Nueva Orden
              </button>
              <button
                onClick={() => setConfirmedReservation(null)}
                className="px-3 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white font-medium text-xs transition-all"
              >
                Cerrar Notificación
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-100 font-medium block">Orden de Compra</span>
              <span className="font-mono font-bold text-base mt-0.5 block">{confirmedReservation.orderId}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-100 font-medium block">Fecha de Entrega</span>
              <span className="font-bold text-base mt-0.5 block">
                {confirmedReservation.timeBlock?.date || selectedDate}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-100 font-medium block">Horario Ventana</span>
              <span className="font-bold text-base mt-0.5 block">
                {confirmedReservation.timeBlock?.startTime} - {confirmedReservation.timeBlock?.endTime}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl p-3.5 backdrop-blur-sm border border-white/10">
              <span className="text-xs text-emerald-100 font-medium block">Costo de Despacho</span>
              <span className="font-bold text-base mt-0.5 block">
                {formatCurrency(confirmedReservation.timeBlock?.cost || 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESERVAS ACTIVAS PARA ESTA ORDEN */}
      {existingReservations.length > 0 && !confirmedReservation && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-amber-900">
                  Esta orden ya posee una reserva registrada (#{existingReservations[0].id})
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Fecha: <strong className="font-semibold">{existingReservations[0].timeBlock?.date}</strong> | 
                  Horario: <strong className="font-semibold">{existingReservations[0].timeBlock?.startTime} - {existingReservations[0].timeBlock?.endTime}</strong> | 
                  Estado: <span className="font-bold">{existingReservations[0].status}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCancelReservation(existingReservations[0].id)}
              disabled={cancellingId === existingReservations[0].id}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-sm flex-shrink-0 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{cancellingId === existingReservations[0].id ? 'Cancelando...' : 'Cancelar Reserva Existente'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SELECCIÓN DE FECHA Y HORARIO PARA DESPACHO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA: CALENDARIO Y FECHAS DISPONIBLES (4 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Paso 1: Elige la Fecha</h3>
              </div>
              <button
                onClick={() => fetchDates(customer.zoneId)}
                disabled={loadingDates}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                title="Actualizar disponibilidad"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDates ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 mb-4">
              Fechas con capacidad de entrega para la <strong>Zona #{customer.zoneId} ({customer.zoneName})</strong>:
            </p>

            {/* Error de fechas */}
            {dateError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4">
                <p className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Error de conexión</span>
                </p>
                <p className="mt-1">{dateError}</p>
                <p className="mt-2 text-rose-600 font-medium">
                  Asegúrate de que el backend Spring Boot esté corriendo en el puerto 8080.
                </p>
              </div>
            )}

            {/* Loading */}
            {loadingDates && (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                <span className="text-xs">Consultando disponibilidad en backend...</span>
              </div>
            )}

            {/* Lista de Fechas */}
            {!loadingDates && availableDates.length === 0 && !dateError && (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No hay fechas disponibles para esta zona.</p>
                <p className="text-[11px] text-slate-400 mt-1">Prueba seleccionando otra zona en los ajustes.</p>
              </div>
            )}

            {!loadingDates && availableDates.length > 0 && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.date;
                  return (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-tight transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}
                        >
                          {formatDateLabel(item.date).split(' ')[0]}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold capitalize ${isSelected ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                            {formatDateLabel(item.date)}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{item.date}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isSelected
                              ? 'bg-blue-200/80 text-blue-900'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.availableBlockCount} {item.availableBlockCount === 1 ? 'bloque' : 'bloques'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: VENTANAS HORARIAS Y CONFIRMACIÓN (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Paso 2: Elige la Ventana Horaria
                </h3>
              </div>
              {selectedDate && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  {selectedDate}
                </span>
              )}
            </div>

            {/* Error de bloques */}
            {blockError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <p className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Error al cargar bloques</span>
                </p>
                <p className="mt-1">{blockError}</p>
              </div>
            )}

            {/* Estado cuando no hay fecha seleccionada */}
            {!selectedDate && (
              <div className="py-12 text-center text-slate-400">
                <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Selecciona una fecha en el panel izquierdo</p>
                <p className="text-xs text-slate-400 mt-1">Los horarios disponibles para esa fecha aparecerán aquí.</p>
              </div>
            )}

            {/* Loading bloques */}
            {selectedDate && loadingBlocks && (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                <span className="text-xs">Consultando ventanas horarias para el {selectedDate}...</span>
              </div>
            )}

            {/* Lista de bloques horarios */}
            {selectedDate && !loadingBlocks && timeBlocks.length === 0 && !blockError && (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No hay bloques disponibles para el {selectedDate}.</p>
              </div>
            )}

            {selectedDate && !loadingBlocks && timeBlocks.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timeBlocks.map((block) => {
                    const isSelected = selectedBlock?.id === block.id;
                    const isFull = block.full || block.availableSlots <= 0;

                    return (
                      <div
                        key={block.id}
                        onClick={() => {
                          if (!isFull) setSelectedBlock(block);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isFull
                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500 shadow-md text-blue-900'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Checkmark indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="font-bold text-base text-slate-900">
                            {block.startTime} - {block.endTime}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Costo</span>
                            <span className="font-extrabold text-sm text-slate-800">
                              {formatCurrency(block.cost)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cupos</span>
                            {isFull ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                                Agotado
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                {block.availableSlots} {block.availableSlots === 1 ? 'cupo libre' : 'cupos libres'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error de confirmación de reserva */}
            {bookingError && (
              <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">No se pudo realizar la reserva:</span>
                  <p className="mt-0.5">{bookingError}</p>
                </div>
              </div>
            )}

            {/* Botón de Confirmación */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {selectedBlock ? (
                    <div>
                      <p className="text-xs text-slate-500">Ventana seleccionada:</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedDate} de {selectedBlock.startTime} a {selectedBlock.endTime} (
                        {formatCurrency(selectedBlock.cost)})
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Selecciona una franja horaria para habilitar la confirmación.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={!selectedBlock || isSubmitting}
                  className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                    !selectedBlock || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando Reserva...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirmar Reserva</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
