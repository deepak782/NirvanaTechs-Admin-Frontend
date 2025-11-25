import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getQuotationById, updateQuotation } from '@/api/quotations';
import { useToast } from '@/hooks/use-toast';
import { QuotationStatus, UpdateQuotationDto } from '@/types';
import Select from 'react-select';
import api from '@/api/axiosConfig';

const statusOptions = Object.values(QuotationStatus).map(val => ({
  value: val,
  label: val,
}));

export default function EditQuotation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<UpdateQuotationDto>({
    subject: '',
    status: QuotationStatus.DRAFT,
  });

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => getQuotationById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (quotation) {
      setFormData({
        subject: quotation.subject,
        status: quotation.status,
      });
    }
  }, [quotation]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateQuotationDto) => updateQuotation(id!, data),
    onSuccess: async () => {
      if (pdfFile) {
        try {
          const formData = new FormData();
          formData.append('pdf', pdfFile);
          await api.post(`/quotations/${id}/upload-pdf`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (error) {
          console.error('Failed to upload PDF:', error);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Quotation updated successfully',
      });
      navigate('/quotations');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update quotation',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a PDF file',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Quotation</h1>
            <p className="text-muted-foreground mt-2">Update quotation details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter quotation subject"
                  required
                />
              </div>
              
              <div>
                <Label>Status *</Label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find(opt => opt.value === formData.status)}
                  onChange={(option) => setFormData({ ...formData, status: option?.value as QuotationStatus })}
                />
              </div>

              <div>
                <Label htmlFor="pdf">Upload PDF (Optional)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  {pdfFile && (
                    <span className="text-sm text-muted-foreground">{pdfFile.name}</span>
                  )}
                </div>
                {quotation?.pdfUrl && !pdfFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Current PDF:{' '}
                    <a
                      href={quotation.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View
                    </a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/quotations')}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
