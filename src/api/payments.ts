import api from './axiosConfig';
import { Payment, CreatePaymentDto, UpdatePaymentDto, PaymentMethod, PaymentStatus } from '@/types';

// Mock data flag
const USE_MOCK_DATA = false;

// Mock data
const mockPayments: Payment[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'E-commerce Website Development',
    clientName: 'Acme Corp',
    mobile: '+91 9876543210',
    date: '2024-01-20T00:00:00Z',
    amount: 200000,
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PAID,
    reference: 'TXN123456789',
    notes: 'Initial payment received',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
  },
  {
    id: '2',
    projectId: '1',
    projectName: 'E-commerce Website Development',
    clientName: 'Acme Corp',
    mobile: '+91 9876543210',
    date: '2024-02-15T00:00:00Z',
    amount: 150000,
    method: PaymentMethod.UPI,
    status: PaymentStatus.PENDING,
    reference: '',
    notes: 'Milestone payment pending',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
  },
];

export const getPayments = async (): Promise<Payment[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockPayments);
  }
  const response = await api.get('/payments');
  return response.data;
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  if (USE_MOCK_DATA) {
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    return Promise.resolve(payment);
  }
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const getPaymentsByProjectId = async (projectId: string): Promise<Payment[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockPayments.filter(p => p.projectId === projectId));
  }
  const response = await api.get(`/payments`, { params: { projectId } });
  return response.data;
};

export const createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
  if (USE_MOCK_DATA) {
    const newPayment: Payment = {
      id: String(mockPayments.length + 1),
      projectId: data.projectId,
      projectName: 'Mock Project',
      clientName: 'Mock Client',
      mobile: '+91 9876543210',
      date: data.date,
      amount: data.amount,
      method: data.method,
      status: data.status,
      reference: data.reference,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPayments.push(newPayment);
    return Promise.resolve(newPayment);
  }
  const response = await api.post('/payments', data);
  return response.data;
};

export const updatePayment = async (id: string, data: UpdatePaymentDto): Promise<Payment> => {
  if (USE_MOCK_DATA) {
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    mockPayments[index] = { ...mockPayments[index], ...data, updatedAt: new Date().toISOString() };
    return Promise.resolve(mockPayments[index]);
  }
  const response = await api.put(`/payments/${id}`, data);
  return response.data;
};

export const deletePayment = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    const index = mockPayments.findIndex(p => p.id === id);
    if (index !== -1) mockPayments.splice(index, 1);
    return Promise.resolve();
  }
  await api.delete(`/payments/${id}`);
};
