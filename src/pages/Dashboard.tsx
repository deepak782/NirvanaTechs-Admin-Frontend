import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLeads } from '@/api/leads';
import { getQuotations } from '@/api/quotations';

export default function Dashboard() {
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const { data: quotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: getQuotations,
  });

  const stats = [
    {
      title: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Quotations',
      value: quotations.length,
      icon: FileText,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Active Requirements',
      value: leads.filter(l => l.leadStatus !== 'WON' && l.leadStatus !== 'LOST').length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending Followups',
      value: leads.filter(l => l.followupStatus === 'PENDING').length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your IT Services CRM</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-muted-foreground text-sm">No leads yet</p>
              ) : (
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.technology}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{lead.mobile}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No quotations yet</p>
              ) : (
                <div className="space-y-3">
                  {quotations.slice(0, 5).map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{quotation.refNo}</p>
                        <p className="text-sm text-muted-foreground">{quotation.subject}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{quotation.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
