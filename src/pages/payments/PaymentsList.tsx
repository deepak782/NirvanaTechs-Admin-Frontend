import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPayments } from '@/api/payments';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { PaymentStatus, PaymentMethod } from '@/types';

export default function PaymentsList() {
  const navigate = useNavigate();
  const [searchMobile, setSearchMobile] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });

  const formatDate = (dateString: string) => {
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

  const getStatusColor = (status: PaymentStatus) => {
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

  const filteredPayments = payments.filter(payment => {
    const matchesMobile = !searchMobile || payment.mobile.includes(searchMobile);
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    return matchesMobile && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground mt-2">Track project payments</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by mobile..."
                    value={searchMobile}
                    onChange={(e) => setSearchMobile(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                  <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                  <SelectItem value={PaymentStatus.REFUNDED}>Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading payments...
            </CardContent>
          </Card>
        ) : filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No payments found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Mobile</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-4">{formatDate(payment.date)}</td>
                        <td className="p-4 font-medium">{payment.projectName}</td>
                        <td className="p-4">{payment.clientName}</td>
                        <td className="p-4">{payment.mobile}</td>
                        <td className="p-4 text-right font-medium">{formatCurrency(payment.amount)}</td>
                        <td className="p-4">{payment.method.replace(/_/g, ' ')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-4">{payment.reference || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
