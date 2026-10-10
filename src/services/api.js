/**
 * API client for WMRT Dispatch Window Reservation Service
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const API_KEY = import.meta.env.VITE_API_KEY || 'wmrt-secret-api-key-2026';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Accept': 'application/json',
    'X-API-KEY': API_KEY,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        `Error HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network / connection errors
    throw new ApiError(
      `No se pudo conectar con el servidor backend (${error.message || 'Error de red'}). Verifica que el servicio esté ejecutándose en http://localhost:8080.`,
      0,
      { originalError: error.message }
    );
  }
}

export const api = {
  // Test connection
  checkHealth: async () => {
    return request('/v1/zones');
  },

  // Zones
  getZones: async () => {
    return request('/v1/zones');
  },

  getZoneById: async (zoneId) => {
    return request(`/v1/zones/${zoneId}`);
  },

  // Availability
  getAvailableDates: async (zoneId, from = '', to = '') => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/v1/availability/zones/${zoneId}/dates${queryString}`);
  },

  getTimeBlocks: async (zoneId, date) => {
    return request(`/v1/availability/zones/${zoneId}/blocks?date=${encodeURIComponent(date)}`);
  },

  getTimeBlockById: async (blockId) => {
    return request(`/v1/availability/blocks/${blockId}`);
  },

  // Reservations
  createReservation: async ({ orderId, timeBlockId, customerName, address }) => {
    return request('/v1/reservations', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        timeBlockId: Number(timeBlockId),
        customerName,
        address,
      }),
    });
  },

  getAllReservations: async () => {
    return request('/v1/reservations');
  },

  getReservationById: async (id) => {
    return request(`/v1/reservations/${id}`);
  },

  getReservationByOrderId: async (orderId) => {
    return request(`/v1/reservations/order/${encodeURIComponent(orderId)}`);
  },

  cancelReservation: async (id) => {
    return request(`/v1/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ApiError };
