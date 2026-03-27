import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Vehicle {
  id: string;
  color: string;
  brand: string;
  model: string;
  plate: string;
}

export interface Registration {
  id: string;
  // Datos iniciales
  carnet: string;
  dpi: string;
  vehicleType: 'moto' | 'carro';
  parkingPlan: 'entre-semana' | 'sabado' | 'domingo';
  // Datos personales
  fullName: string;
  address: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  photo?: string;
  // Vehículos
  vehicles: Vehicle[];
  // Pago
  amount: number;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentStatus: 'pending' | 'paid';
  // Firma
  signature?: string;
  // Metadata
  createdAt: Date;
}

interface RegistrationContextType {
  currentRegistration: Partial<Registration>;
  registrations: Registration[];
  updateRegistration: (data: Partial<Registration>) => void;
  completeRegistration: () => void;
  getRegistrationById: (id: string) => Registration | undefined;
  resetRegistration: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [currentRegistration, setCurrentRegistration] = useState<Partial<Registration>>(
    import.meta.env.DEV
      ? {
          carnet: '7890-23-1234',
          dpi: '2356789012345',
          vehicleType: 'carro',
          parkingPlan: 'sabado',
          fullName: 'Juan Carlos Méndez López',
          address: 'Zona 10, 12 calle 1-25, Guatemala City',
          phone: '5555-1234',
          emergencyContact: 'María López',
          emergencyPhone: '5555-5678',
          vehicles: [{ id: 'v1', color: 'Rojo', brand: 'Toyota', model: 'Corolla', plate: 'P-123-ABC' }],
          amount: 80,
          cardHolder: 'JUAN MENDEZ',
          cardNumber: '4111 1111 1111 1111',
          expiryDate: '12/26',
          cvv: '123',
          paymentStatus: 'pending',
        }
      : { vehicles: [], paymentStatus: 'pending' }
  );
  
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('parkingRegistrations');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      }));
    }
    return [];
  });

  useEffect(() => {
    const toSave = registrations.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
    localStorage.setItem('parkingRegistrations', JSON.stringify(toSave));
  }, [registrations]);

  const updateRegistration = (data: Partial<Registration>) => {
    setCurrentRegistration((prev) => ({ ...prev, ...data }));
  };

  const completeRegistration = () => {
    const newRegistration: Registration = {
      id: Date.now().toString(),
      carnet: currentRegistration.carnet || '',
      dpi: currentRegistration.dpi || '',
      vehicleType: currentRegistration.vehicleType || 'carro',
      parkingPlan: currentRegistration.parkingPlan || 'entre-semana',
      fullName: currentRegistration.fullName || '',
      address: currentRegistration.address || '',
      phone: currentRegistration.phone || '',
      emergencyContact: currentRegistration.emergencyContact || '',
      emergencyPhone: currentRegistration.emergencyPhone || '',
      photo: currentRegistration.photo,
      vehicles: currentRegistration.vehicles || [],
      amount: currentRegistration.amount || 0,
      cardHolder: currentRegistration.cardHolder || '',
      cardNumber: currentRegistration.cardNumber || '',
      expiryDate: currentRegistration.expiryDate || '',
      cvv: currentRegistration.cvv || '',
      paymentStatus: 'paid',
      signature: currentRegistration.signature,
      createdAt: new Date(),
    };

    setRegistrations((prev) => [newRegistration, ...prev]);
    resetRegistration();
  };

  const getRegistrationById = (id: string) => {
    return registrations.find((r) => r.id === id);
  };

  const resetRegistration = () => {
    setCurrentRegistration({
      vehicles: [],
      paymentStatus: 'pending',
    });
  };

  return (
    <RegistrationContext.Provider
      value={{
        currentRegistration,
        registrations,
        updateRegistration,
        completeRegistration,
        getRegistrationById,
        resetRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}
