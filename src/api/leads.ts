import api from "./axiosConfig";
import { Lead, CreateLeadDto, UpdateLeadDto } from "@/types";

export const getLeads = async (): Promise<Lead[]> => {
  const { data } = await api.get("/leads");
  return data.leads;
};

export const getLeadById = async (id: string): Promise<Lead> => {
  const { data } = await api.get(`/leads/${id}`);
  return data.lead;
};

export const getLeadsByMobile = async (mobile: string): Promise<Lead[]> => {
  const { data } = await api.get(`/leads/by-mobile/${mobile}`);
  return data.requirements || [];
};

export const createLead = async (lead: CreateLeadDto): Promise<Lead> => {
  const { data } = await api.post("/leads", lead);
  return data.lead;
};

export const updateLead = async (id: string, lead: UpdateLeadDto): Promise<Lead> => {
  const { data } = await api.put(`/leads/${id}`, lead);
  return data.updated;
};