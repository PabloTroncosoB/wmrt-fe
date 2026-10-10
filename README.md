# WMRT Dispatch Frontend (`wmrt-fe`)

Frontend en React desarrollado para la prueba técnica de reserva de ventanas de despacho de **WMRT** (conectado al backend Spring Boot en `C:\Users\pab\code\wmrt`).

---

## 🚀 Arquitectura y Tecnologías

| Componente | Tecnología | Versión |
|---|---|---|
| Framework UI | **React** + **Vite** | React 18 / Vite 5 |
| Enrutamiento | **React Router DOM** | v6.28 |
| Estilos | **Tailwind CSS** + PostCSS | v3.4 |
| Iconografía | **Lucide React** | v0.460 |
| Estado Global | **React Context API** (`CustomerContext`) con persistencia en `localStorage` | Nativo |
| Cliente HTTP | **Fetch API** con interceptor y proxy dev en Vite | Nativo |

---

## 📄 Estructura de Páginas

El proyecto cuenta con **exactamente 2 páginas**, cumpliendo con los requisitos solicitados:

1. **Página Principal (`/`) - Reserva de Ventanas de Despacho:**
   - **Resumen superior de la orden y cliente:** Muestra el ID de la orden (`orderId`), nombre del cliente (`customerName`), dirección de despacho (`address`) y zona asignada (`zoneName`).
   - **Botón de Settings:** Acceso directo e intuitivo a la página de configuración de cliente.
   - **Selector de Fechas:** Consume `GET /api/v1/availability/zones/{zoneId}/dates` para listar los días hábiles con cupos disponibles y la cantidad de bloques libres.
   - **Selector de Horarios (Ventanas de Despacho):** Consume `GET /api/v1/availability/zones/{zoneId}/blocks?date=YYYY-MM-DD` mostrando cada franja con su horario, costo en CLP (`$`), cupos libres y estado de disponibilidad.
   - **Confirmación de Reserva:** Envía `POST /api/v1/reservations` con `{ orderId, timeBlockId, customerName, address }`.
   - **Ticket / Comprobante de Reserva:** Al reservar, despliega el comprobante con status `CONFIRMED` y opción de generar una nueva orden.
   - **Historial y Cancelación:** Permite visualizar reservas activas y cancelarlas (`DELETE /api/v1/reservations/{id}`), liberando el cupo inmediatamente.

2. **Página de Configuración de Cliente (`/settings`):**
   - **Datos editables:** Nombre completo, dirección de entrega, zona geográfica de despacho (cargadas dinámicamente desde `GET /api/v1/zones`), identificador de orden (con botón para generar nuevo ID aleatorio `ORD-2026-XXX`), teléfono, correo y notas de entrega.
   - **Persistencia:** Almacenado en `localStorage` para mantener la sesión activa entre recargas.
   - **Navegación:** Botones para guardar datos y volver inmediatamente a la página de reservas.

---

## ⚙️ Variables de Entorno

El archivo `.env` en la raíz de `wmrt-fe` configura la conexión:

```env
# Backend API Base URL (en dev se usa el proxy de Vite para evitar problemas de CORS)
VITE_API_BASE_URL=/api

# Header X-API-KEY requerido por el backend Spring Boot
VITE_API_KEY=wmrt-secret-api-key-2026
```

> **Nota sobre CORS y el Proxy:** En `vite.config.js` se encuentra configurado un proxy de desarrollo para redirigir las peticiones `/api` a `http://localhost:8080`, asegurando que no existan bloqueos de CORS ni fallos en preflight (`OPTIONS`).

---

## 🛠️ Cómo Levantar el Frontend

### 1. Requisitos
- Node.js 18+ (probado en Node.js v24 y npm 12)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 4. Compilar para producción
```bash
npm run build
```

---

## 🔗 Endpoints del Backend Consumidos

| Método | Endpoint | Utilizado en |
|---|---|---|
| `GET` | `/api/v1/zones` | Navbar (Health check) y Settings (Selector de Zonas) |
| `GET` | `/api/v1/availability/zones/{zoneId}/dates` | Página Principal (Fechas con capacidad) |
| `GET` | `/api/v1/availability/zones/{zoneId}/blocks?date=YYYY-MM-DD` | Página Principal (Franjas horarias y costos) |
| `POST` | `/api/v1/reservations` | Página Principal (Creación de reserva) |
| `GET` | `/api/v1/reservations/order/{orderId}` | Página Principal (Consulta de reserva existente) |
| `DELETE` | `/api/v1/reservations/{id}` | Página Principal (Cancelación y liberación de cupo) |
