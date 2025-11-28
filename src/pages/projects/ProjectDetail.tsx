import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Plus, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProjectById } from '@/api/projects';
import { getPaymentsByProjectId } from '@/api/payments';
import { getLeadById } from '@/api/leads';
import { ProjectStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { createPayment } from '@/api/payments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethod, PaymentStatus } from '@/types';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', id],
    queryFn: () => getPaymentsByProjectId(id!),
    enabled: !!id,
  });

  const { data: lead } = useQuery({
    queryKey: ['lead', project?.leadId],
    queryFn: () => getLeadById(project!.leadId),
    enabled: !!project?.leadId,
  });

  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PAID,
    reference: '',
    notes: '',
  });

  const createPaymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast({
        title: 'Success',
        description: 'Payment added successfully',
      });
      setPaymentDialogOpen(false);
      setPaymentForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        method: PaymentMethod.BANK_TRANSFER,
        status: PaymentStatus.PAID,
        reference: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add payment',
        variant: 'destructive',
      });
    },
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    createPaymentMutation.mutate({
      projectId: project.id,
      date: paymentForm.date,
      amount: parseFloat(paymentForm.amount),
      method: paymentForm.method,
      status: paymentForm.status,
      reference: paymentForm.reference || undefined,
      notes: paymentForm.notes || undefined,
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.NOT_STARTED:
        return 'bg-muted text-muted-foreground';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-primary/10 text-primary';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-500/10 text-yellow-500';
      case ProjectStatus.COMPLETED:
        return 'bg-green-500/10 text-green-500';
      case ProjectStatus.CANCELLED:
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-500/10 text-green-500';
      case PaymentStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-500';
      case PaymentStatus.FAILED:
        return 'bg-destructive/10 text-destructive';
      case PaymentStatus.REFUNDED:
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Project not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
              <p className="text-muted-foreground mt-1">{project.clientName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
              {project.status.replace(/_/g, ' ')}
            </span>
            <Button onClick={() => navigate(`/projects/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Client & Requirement Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Client Name</p>
                <p className="font-medium">{project.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{project.mobile}</p>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`tel:${project.mobile}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`https://wa.me/${project.mobile.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              {lead?.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lead.email}</p>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`mailto:${lead.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Technology</p>
                <p className="font-medium">{project.technology || '-'}</p>
              </div>
              {lead && (
                <div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${lead.id}`)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Lead
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(project.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">{formatCurrency(project.totalAmount)}</p>
              </div>
            </CardContent>
          </Card>

          {project.description && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Description / Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payments Summary</CardTitle>
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Amount (₹) *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={paymentForm.method} onValueChange={(value: PaymentMethod) => setPaymentForm({ ...paymentForm, method: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                        <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                        <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                        <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                        <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Status *</Label>
                    <Select value={paymentForm.status} onValueChange={(value: PaymentStatus) => setPaymentForm({ ...paymentForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                        <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                        <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Reference / Transaction ID</Label>
                    <Input
                      id="paymentReference"
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">Notes</Label>
                    <Textarea
                      id="paymentNotes"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createPaymentMutation.isPending}>
                      {createPaymentMutation.isPending ? 'Adding...' : 'Add Payment'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(project.totalAmount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(project.amountReceived || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(project.balanceAmount || 0)}</p>
                </CardContent>
              </Card>
            </div>

            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.date)} • {payment.method.replace(/_/g, ' ')}
                        {payment.reference && ` • ${payment.reference}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" onClick={() => navigate('/payments')}>
                    View All Payments
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
