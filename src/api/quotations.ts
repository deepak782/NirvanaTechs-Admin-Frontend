import api from "./axiosConfig";
import { Quotation } from "@/types";

export const getQuotations = async (): Promise<Quotation[]> => {
  const { data } = await api.get("/quotations");
  return data.quotations;
};

export const getQuotationById = async (id: string): Promise<Quotation> => {
  const { data } = await api.get(`/quotations/${id}`);
  return data.quotation;
};

export const createQuotation = async (payload: FormData): Promise<Quotation> => {
  const { data } = await api.post("/quotations", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.quotation;
};

export const updateQuotation = async (id: string, payload: FormData): Promise<Quotation> => {
  const { data } = await api.put(`/quotations/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.quotation;
};

export const deleteQuotation = async (id: string): Promise<void> => {
  await api.delete(`/quotations/${id}`);
};

interface UploadQuotationParams {
  leadId?: string;
  clientId?: string | null; // optional, ignored in backend now
  refNo: string;
  subject: string;
  totalProjectInvestment?: number;
  pdf: Blob;
  fileName: string;
}

export const uploadQuotationPdf = async (params: UploadQuotationParams) => {
  const formData = new FormData();

  if (params.leadId) {
    formData.append("leadId", params.leadId);
  }

  formData.append("refNo", params.refNo);
  formData.append("subject", params.subject);

  if (params.totalProjectInvestment) {
    formData.append(
      "totalProjectInvestment",
      params.totalProjectInvestment.toString()
    );
  }

  formData.append("pdf", params.pdf, params.fileName);

  const { data } = await api.post("/quotations", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.quotation;
};