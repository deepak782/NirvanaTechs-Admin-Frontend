import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuotations, deleteQuotation } from '@/api/quotations';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

export default function QuotationsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: getQuotations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: 'Success',
        description: 'Quotation deleted successfully',
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete quotation',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString?: string) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-muted text-muted-foreground';
      case 'SENT':
        return 'bg-primary/10 text-primary';
      case 'APPROVED':
        return 'bg-success/10 text-success';
      case 'REJECTED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quotations</h1>
            <p className="text-muted-foreground mt-2">Manage your quotations</p>
          </div>
          <Button onClick={() => navigate('/quotations/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quotation
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading quotations...
            </CardContent>
          </Card>
        ) : quotations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No quotations found</p>
              <Button onClick={() => navigate('/quotations/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quotation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Ref No</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Client Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Mobile</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Technology</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Subject</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-4 font-medium">{quotation.refNo}</td>
                        <td className="p-4">{quotation.lead?.name || '-'}</td>
                        <td className="p-4">{quotation.lead?.mobile || '-'}</td>
                        <td className="p-4">{quotation.lead?.technology || '-'}</td>
                        <td className="p-4">{quotation.subject}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quotation.status)}`}>
                            {quotation.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{formatDate(quotation.createdAt)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {quotation.pdfUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <a href={`${import.meta.env.VITE_API_BASE_URL}${quotation.pdfUrl}`} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(quotation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this quotation? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
