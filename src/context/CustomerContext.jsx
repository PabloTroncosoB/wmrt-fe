import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

const STORAGE_KEY = 'wmrt_customer_data';

const defaultCustomer = {
  customerName: 'Pedro Perez',
  address: 'Monjitas, 2334, La Serena, Coquimbo',
  zoneId: '2',
  zoneName: 'La Serena',
  orderId: 'ORD-2026-101',
};

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filtrar solo los campos requeridos por los endpoints
        return {
          customerName: parsed.customerName || defaultCustomer.customerName,
          address: parsed.address || defaultCustomer.address,
          zoneId: parsed.zoneId || defaultCustomer.zoneId,
          zoneName: parsed.zoneName || defaultCustomer.zoneName,
          orderId: parsed.orderId || defaultCustomer.orderId,
        };
      }
    } catch (e) {
      console.warn('Error reading customer from localStorage', e);
    }
    return defaultCustomer;
  });

  const [hasConfigured, setHasConfigured] = useState(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

  const saveCustomer = (newData) => {
    const updated = {
      customerName: newData.customerName ?? customer.customerName,
      address: newData.address ?? customer.address,
      zoneId: newData.zoneId ?? customer.zoneId,
      zoneName: newData.zoneName ?? customer.zoneName,
      orderId: newData.orderId ?? customer.orderId,
    };
    setCustomer(updated);
    setHasConfigured(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving customer to localStorage', e);
    }
  };

  const generateNewOrderId = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newOrderId = `ORD-2026-${randomSuffix}`;
    saveCustomer({ orderId: newOrderId });
    return newOrderId;
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        saveCustomer,
        generateNewOrderId,
        hasConfigured,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
