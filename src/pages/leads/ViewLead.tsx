import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Phone, Mail, MessageCircle, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLeadById } from '@/api/leads';
import { getQuotations } from '@/api/quotations';

export default function ViewLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLeadById(id!),
    enabled: !!id,
  });

  const { data: allQuotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: getQuotations,
  });

  const leadQuotations = allQuotations.filter(q => q.leadId === id);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Lead not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/leads")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
              <p className="text-muted-foreground mt-1">{lead.mobile}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Quotation for this requirement */}
            <Button
              variant="default"
              onClick={() => navigate(`/quotations/create?leadId=${id}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quotation
            </Button>

            {/* Edit requirement */}
            <Button variant="outline" onClick={() => navigate(`/leads/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{lead.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{lead.mobile}</p>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`tel:${lead.mobile}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              {lead.email && (
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
              {lead.whatsapp && (
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lead.whatsapp}</p>
                    <Button size="sm" variant="ghost" asChild>
                      <a
                        href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Technology</p>
                <p className="font-medium">{lead.technology}</p>
              </div>
              {lead.platform && (
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium">{lead.platform}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Received Date</p>
                <p className="font-medium">{formatDate(lead.receivedDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lead Source</p>
                <p className="font-medium">{lead.leadSource}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Lead Status</p>
                <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
                  {lead.leadStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Followup Status</p>
                <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground">
                  {lead.followupStatus}
                </span>
              </div>
              {lead.followupDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Followup Date</p>
                  <p className="font-medium">{formatDate(lead.followupDate)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-muted text-muted-foreground">
                  {lead.budget}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">
                {lead.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>
        </div>
         <div className="flex gap-4">

          <Button onClick={() => navigate(`/projects/create?leadId=${id}`)}>

            <Plus className="h-4 w-4 mr-2" />

            Create Project

          </Button>

          <Button onClick={() => navigate(`/followups/create?leadId=${id}`)} variant="outline">

            <Plus className="h-4 w-4 mr-2" />

            Add Follow-up

          </Button>

        </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quotations</CardTitle>
              {/* Create Quotation removed for View Lead screen */}
            </CardHeader>

            <CardContent>
              {leadQuotations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No quotations yet</p>
              ) : (
                <div className="space-y-3">
                  {leadQuotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20"
                    >
                      <div>
                        <p className="font-medium">{quotation.refNo}</p>
                        <p className="text-sm text-muted-foreground">{quotation.subject}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {quotation.status}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(quotation.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
}
