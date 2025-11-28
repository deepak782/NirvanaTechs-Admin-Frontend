import api from './axiosConfig';
import { Followup, CreateFollowupDto, UpdateFollowupDto, FollowupStatus } from '@/types';

// Mock data flag
const USE_MOCK_DATA = false;

// Mock data
const mockFollowups: Followup[] = [
  {
    id: '1',
    leadId: '1',
    mobile: '+91 9876543210',
    name: 'Acme Corp',
    technology: 'React',
    followupDate: '2024-01-15T10:00:00Z',
    status: FollowupStatus.PENDING,
    notes: 'Discuss project timeline and deliverables',
    nextFollowupDate: '2024-01-22T10:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    leadId: '2',
    mobile: '+91 9876543211',
    name: 'Tech Solutions Ltd',
    technology: 'Node.js',
    followupDate: '2024-01-14T14:00:00Z',
    status: FollowupStatus.COMPLETED,
    notes: 'Requirements gathering session completed',
    nextFollowupDate: null,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
  },
];

export const getFollowups = async (): Promise<Followup[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockFollowups);
  }
  const response = await api.get('/followups');
  return response.data;
};

export const getFollowupById = async (id: string): Promise<Followup> => {
  if (USE_MOCK_DATA) {
    const followup = mockFollowups.find(f => f.id === id);
    if (!followup) throw new Error('Followup not found');
    return Promise.resolve(followup);
  }
  const response = await api.get(`/followups/${id}`);
  return response.data;
};

export const getFollowupsByLeadId = async (leadId: string): Promise<Followup[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockFollowups.filter(f => f.leadId === leadId));
  }
  const response = await api.get(`/followups`, { params: { leadId } });
  return response.data;
};

export const createFollowup = async (data: CreateFollowupDto): Promise<Followup> => {
  if (USE_MOCK_DATA) {
    const newFollowup: Followup = {
      id: String(mockFollowups.length + 1),
      leadId: data.leadId,
      mobile: '+91 9876543210',
      name: 'Mock Client',
      technology: 'Mock Tech',
      followupDate: data.followupDate,
      status: data.status,
      notes: data.notes,
      nextFollowupDate: data.nextFollowupDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockFollowups.push(newFollowup);
    return Promise.resolve(newFollowup);
  }
  const response = await api.post('/followups', data);
  return response.data;
};

export const updateFollowup = async (id: string, data: UpdateFollowupDto): Promise<Followup> => {
  if (USE_MOCK_DATA) {
    const index = mockFollowups.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Followup not found');
    mockFollowups[index] = { ...mockFollowups[index], ...data, updatedAt: new Date().toISOString() };
    return Promise.resolve(mockFollowups[index]);
  }
  const response = await api.put(`/followups/${id}`, data);
  return response.data;
};

export const deleteFollowup = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    const index = mockFollowups.findIndex(f => f.id === id);
    if (index !== -1) mockFollowups.splice(index, 1);
    return Promise.resolve();
  }
  await api.delete(`/followups/${id}`);
};

export const markFollowupCompleted = async (id: string): Promise<Followup> => {
  if (USE_MOCK_DATA) {
    return updateFollowup(id, { status: FollowupStatus.COMPLETED });
  }
  const response = await api.patch(`/followups/${id}/status`, { status: 'COMPLETED' });
  return response.data;
};
