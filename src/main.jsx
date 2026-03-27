import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@flaticon/flaticon-uicons/css/all/all.css';
import './index.css';
import './modules/parking/styles/index.css';

if (import.meta.env.DEV) {
  const MOCK_IDS = ['mock-001', 'mock-002', 'mock-003'];
  const MOCK_DATA = [
    {
      id: 'mock-001',
      carnet: '7890-23-1234',
      dpi: '2356789012345',
      vehicleType: 'carro',
      parkingPlan: 'entre-semana',
      fullName: 'Juan Carlos Méndez López',
      address: 'Zona 10, 12 calle 1-25, Guatemala City',
      phone: '5555-1234',
      emergencyContact: 'María López',
      emergencyPhone: '5555-5678',
      vehicles: [{ id: 'v1', color: 'Rojo', brand: 'Toyota', model: 'Corolla', plate: 'P-123-ABC' }],
      amount: 200,
      cardHolder: '', cardNumber: '', expiryDate: '', cvv: '',
      paymentStatus: 'paid',
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'mock-002',
      carnet: '4521-22-5678',
      dpi: '1234567890123',
      vehicleType: 'moto',
      parkingPlan: 'sabado',
      fullName: 'Andrea Sofía Ramírez García',
      address: 'Zona 7, Calzada Roosevelt 15-40, Guatemala City',
      phone: '4444-9876',
      emergencyContact: 'Roberto Ramírez',
      emergencyPhone: '4444-1111',
      vehicles: [{ id: 'v2', color: 'Negro', brand: 'Honda', model: 'CB190R', plate: 'M-456-XYZ' }],
      amount: 80,
      cardHolder: '', cardNumber: '', expiryDate: '', cvv: '',
      paymentStatus: 'paid',
      createdAt: '2026-03-15T14:30:00.000Z',
    },
    {
      id: 'mock-003',
      carnet: '3301-24-9999',
      dpi: '9876543210987',
      vehicleType: 'carro',
      parkingPlan: 'domingo',
      fullName: 'Carlos Enrique Pérez Solís',
      address: 'Zona 1, 6a avenida 12-34, Guatemala City',
      phone: '3333-4567',
      emergencyContact: 'Luisa Solís',
      emergencyPhone: '3333-8888',
      vehicles: [
        { id: 'v3', color: 'Blanco', brand: 'Nissan', model: 'Sentra', plate: 'O-789-DEF' },
        { id: 'v4', color: 'Azul', brand: 'Suzuki', model: 'Swift', plate: 'P-321-GHI' },
      ],
      amount: 50,
      cardHolder: '', cardNumber: '', expiryDate: '', cvv: '',
      paymentStatus: 'paid',
      createdAt: '2026-03-20T09:15:00.000Z',
    },
  ];

  const saved = localStorage.getItem('parkingRegistrations');
  const existing = saved ? JSON.parse(saved) : [];
  const withoutMocks = existing.filter((r) => !MOCK_IDS.includes(r.id));
  localStorage.setItem('parkingRegistrations', JSON.stringify([...MOCK_DATA, ...withoutMocks]));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
