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

export enum ProjectStatus {

  NOT_STARTED = "NOT_STARTED",

  IN_PROGRESS = "IN_PROGRESS",

  ON_HOLD = "ON_HOLD",

  COMPLETED = "COMPLETED",

  CANCELLED = "CANCELLED"

}



export enum PaymentStatus {

  PAID = "PAID",

  PENDING = "PENDING",

  FAILED = "FAILED",

  REFUNDED = "REFUNDED"

}



export enum PaymentMethod {

  CASH = "CASH",

  UPI = "UPI",

  BANK_TRANSFER = "BANK_TRANSFER",

  CARD = "CARD",

  OTHER = "OTHER"

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

export interface UpdateQuotationDto extends Partial<CreateQuotationDto> {
  pdfFile?: File | null;   // required for FormData upload
}

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

// Followup interfaces

export interface Followup {

  id: string;

  leadId: string;

  mobile: string;

  name: string;

  technology?: string;

  followupDate: string;

  status: FollowupStatus;

  notes?: string;

  nextFollowupDate?: string | null;

  createdAt: string;

  updatedAt: string;

}



export interface CreateFollowupDto {

  leadId: string;

  followupDate: string;

  status: FollowupStatus;

  notes?: string;

  nextFollowupDate?: string;

}



export interface UpdateFollowupDto extends Partial<CreateFollowupDto> {}



// Project interfaces

export interface Project {

  id: string;

  name: string;

  leadId: string;

  mobile: string;

  clientName: string;

  technology?: string;

  startDate?: string | null;

  endDate?: string | null;

  status: ProjectStatus;

  totalAmount: number;

  description?: string;

  createdAt: string;

  updatedAt: string;

  amountReceived?: number;

  balanceAmount?: number;

}



export interface CreateProjectDto {

  name: string;

  leadId: string;

  startDate?: string;

  endDate?: string;

  status: ProjectStatus;

  totalAmount: number;

  description?: string;

}



export interface UpdateProjectDto extends Partial<CreateProjectDto> {}



// Payment interfaces

export interface Payment {

  id: string;

  projectId: string;

  projectName: string;

  clientName: string;

  mobile: string;

  date: string;

  amount: number;

  method: PaymentMethod;

  status: PaymentStatus;

  reference?: string;

  notes?: string;

  createdAt: string;

  updatedAt: string;

}



export interface CreatePaymentDto {

  projectId: string;

  date: string;

  amount: number;

  method: PaymentMethod;

  status: PaymentStatus;

  reference?: string;

  notes?: string;

}



export interface UpdatePaymentDto extends Partial<CreatePaymentDto> {}
