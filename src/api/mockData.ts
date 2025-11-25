// Mock data for testing without backend
import { Lead, Quotation, FollowupStatus, LeadStatus, LeadBudget, QuotationStatus } from '@/types';

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    mobile: '+91-9876543210',
    email: 'john@example.com',
    whatsapp: '+91-9876543210',
    technology: 'Flutter',
    platform: 'Cross-Platform',
    receivedDate: '2025-01-15',
    leadSource: 'Website',
    followupStatus: FollowupStatus.PENDING,
    followupDate: '2025-01-20',
    budget: LeadBudget.FROM_1L_TO_3L,
    leadStatus: LeadStatus.NEW,
    description: 'Mobile app for food delivery service',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    mobile: '+91-9876543211',
    email: 'jane@example.com',
    whatsapp: '+91-9876543211',
    technology: 'React.js',
    platform: 'Web',
    receivedDate: '2025-01-10',
    leadSource: 'Referral',
    followupStatus: FollowupStatus.IN_PROGRESS,
    followupDate: '2025-01-18',
    budget: LeadBudget.FROM_3L_TO_5L,
    leadStatus: LeadStatus.QUALIFIED,
    description: 'E-commerce website with admin panel',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
];

export const mockQuotations: Quotation[] = [
  {
    id: '1',
    leadId: '1',
    refNo: 'NT/QUO/2025/001',
    subject: 'Food Delivery Mobile App Development',
    status: QuotationStatus.SENT,
    pdfUrl: '#',
    clientName: 'John Doe',
    mobile: '+91-9876543210',
    technology: 'Flutter',
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
  },
];

let leads = [...mockLeads];
let quotations = [...mockQuotations];

export const getMockLeads = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...leads];
};

export const getMockLeadById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const lead = leads.find(l => l.id === id);
  if (!lead) throw new Error('Lead not found');
  return lead;
};

export const getMockLeadsByMobile = async (mobile: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return leads.filter(l => l.mobile === mobile);
};

export const createMockLead = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newLead: Lead = {
    ...data,
    id: String(leads.length + 1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.push(newLead);
  return newLead;
};

export const updateMockLead = async (id: string, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = leads.findIndex(l => l.id === id);
  if (index === -1) throw new Error('Lead not found');
  leads[index] = {
    ...leads[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return leads[index];
};

export const getMockQuotations = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...quotations];
};

export const getMockQuotationById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const quotation = quotations.find(q => q.id === id);
  if (!quotation) throw new Error('Quotation not found');
  return quotation;
};

export const createMockQuotation = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newQuotation: Quotation = {
    ...data,
    id: String(quotations.length + 1),
    refNo: `NT/QUO/2025/${String(quotations.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  quotations.push(newQuotation);
  return newQuotation;
};

export const updateMockQuotation = async (id: string, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = quotations.findIndex(q => q.id === id);
  if (index === -1) throw new Error('Quotation not found');
  quotations[index] = {
    ...quotations[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return quotations[index];
};

export const deleteMockQuotation = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  quotations = quotations.filter(q => q.id !== id);
};
