import api from './axiosConfig';
import { Project, CreateProjectDto, UpdateProjectDto, ProjectStatus } from '@/types';

// Mock data flag
const USE_MOCK_DATA = false;

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Website Development',
    leadId: '1',
    mobile: '+91 9876543210',
    clientName: 'Acme Corp',
    technology: 'React',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-03-20T00:00:00Z',
    status: ProjectStatus.IN_PROGRESS,
    totalAmount: 500000,
    description: 'Full-featured e-commerce platform with payment integration',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    amountReceived: 200000,
    balanceAmount: 300000,
  },
  {
    id: '2',
    name: 'Mobile App Development',
    leadId: '2',
    mobile: '+91 9876543211',
    clientName: 'Tech Solutions Ltd',
    technology: 'React Native',
    startDate: '2024-02-01T00:00:00Z',
    endDate: null,
    status: ProjectStatus.NOT_STARTED,
    totalAmount: 750000,
    description: 'Cross-platform mobile application for iOS and Android',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
    amountReceived: 0,
    balanceAmount: 750000,
  },
];

export const getProjects = async (): Promise<Project[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockProjects);
  }
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  if (USE_MOCK_DATA) {
    const project = mockProjects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    return Promise.resolve(project);
  }
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const getProjectsByMobile = async (mobile: string): Promise<Project[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockProjects.filter(p => p.mobile === mobile));
  }
  const response = await api.get(`/projects/by-mobile/${mobile}`);
  return response.data;
};

export const createProject = async (data: CreateProjectDto): Promise<Project> => {
  if (USE_MOCK_DATA) {
    const newProject: Project = {
      id: String(mockProjects.length + 1),
      name: data.name,
      leadId: data.leadId,
      mobile: '+91 9876543210',
      clientName: 'Mock Client',
      technology: 'Mock Tech',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      status: data.status,
      totalAmount: data.totalAmount,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      amountReceived: 0,
      balanceAmount: data.totalAmount,
    };
    mockProjects.push(newProject);
    return Promise.resolve(newProject);
  }
  const response = await api.post('/projects', data);
  return response.data;
};

export const updateProject = async (id: string, data: UpdateProjectDto): Promise<Project> => {
  if (USE_MOCK_DATA) {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');
    mockProjects[index] = { ...mockProjects[index], ...data, updatedAt: new Date().toISOString() };
    return Promise.resolve(mockProjects[index]);
  }
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    const index = mockProjects.findIndex(p => p.id === id);
    if (index !== -1) mockProjects.splice(index, 1);
    return Promise.resolve();
  }
  await api.delete(`/projects/${id}`);
};
