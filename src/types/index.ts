// Enums
export enum FollowupStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  NOT_INTERESTED = "NOT_INTERESTED",
}

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUOTATION_SENT = "QUOTATION_SENT",
  CLOSED = "CLOSED",
  LOST = "LOST",
}

export enum LeadBudget {
  LT_1_LAKH = "LT_1_LAKH",
  BETWEEN_1_3L = "BETWEEN_1_3L",
  GT_3_LAKH = "GT_3_LAKH",
}

export enum QuotationStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  APPROVED = "APPROVED",
}

// Lead interfaces
export interface Lead {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  whatsapp?: string;
  technology: string;
  platform?: string;
  receivedDate: string;
  leadSource: string;
  followupStatus: FollowupStatus;
  followupDate?: string;
  budget: LeadBudget;
  leadStatus: LeadStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  name: string;
  mobile: string;
  email?: string;
  whatsapp?: string;
  technology: string;
  platform?: string;
  receivedDate: string;
  leadSource: string;
  followupStatus: FollowupStatus;
  followupDate?: string;
  budget: LeadBudget;
  leadStatus: LeadStatus;
  description?: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

// Quotation interfaces
export interface QuotationLead {
  id: string;
  name: string;
  mobile: string;
  technology: string;
}

export interface Quotation {
  id: string;
  leadId: string;
  refNo: string;
  subject: string;
  status: QuotationStatus;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;

  // NEW — backend returns this nested object
  lead?: QuotationLead | null;
}

export interface CreateQuotationDto {
  leadId: string;
  subject: string;
  status: QuotationStatus;
  pdfUrl?: string;
}

export interface UpdateQuotationDto extends Partial<CreateQuotationDto> {}

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}
