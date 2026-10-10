import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

const STORAGE_KEY = 'wmrt_customer_data';

const defaultCustomer = {
  customerName: 'Juan Pérez',
  address: 'Av. Providencia 1234, Providencia',
  zoneId: '2',
  zoneName: 'Centro',
  orderId: 'ORD-2026-101',
  phone: '+56 9 8765 4321',
  email: 'juan.perez@example.cl',
  notes: 'Dejar en conserjería si no responde timbre',
};

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultCustomer, ...JSON.parse(saved) };
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
    const updated = { ...customer, ...newData };
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
