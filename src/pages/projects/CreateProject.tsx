import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createProject } from '@/api/projects';
import { getLeadsByMobile, getLeadById } from '@/api/leads';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { ProjectStatus, Lead } from '@/types';

export default function CreateProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedLeadId = searchParams.get('leadId');

  const [mobile, setMobile] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    technology: '',
    startDate: '',
    endDate: '',
    status: ProjectStatus.NOT_STARTED,
    totalAmount: '',
    description: '',
  });

  // If preselectedLeadId is provided, fetch that lead
  const { data: preselectedLead } = useQuery({
    queryKey: ['lead', preselectedLeadId],
    queryFn: () => getLeadById(preselectedLeadId!),
    enabled: !!preselectedLeadId,
  });

  useEffect(() => {
    if (preselectedLead) {
      setSelectedLead(preselectedLead);
      setFormData({
        ...formData,
        clientName: preselectedLead.name,
        technology: preselectedLead.technology,
      });
      setShowForm(true);
    }
  }, [preselectedLead]);

  const { data: leads = [], refetch: fetchLeads } = useQuery({
    queryKey: ['leads-by-mobile', mobile],
    queryFn: () => getLeadsByMobile(mobile),
    enabled: false,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      navigate('/projects');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const handleFetchLeads = async () => {
    if (!mobile) {
      toast({
        title: 'Error',
        description: 'Please enter a mobile number',
        variant: 'destructive',
      });
      return;
    }
    const result = await fetchLeads();
    if (!result.data || result.data.length === 0) {
      toast({
        title: 'No Requirements Found',
        description: 'No requirements found for this mobile. Please create a lead first.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      ...formData,
      clientName: lead.name,
      technology: lead.technology,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    createMutation.mutate({
      name: formData.name,
      leadId: selectedLead.id,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      status: formData.status,
      totalAmount: parseFloat(formData.totalAmount),
      description: formData.description || undefined,
    });
  };

  if (preselectedLeadId && !preselectedLead) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Project</h1>
            <p className="text-muted-foreground mt-1">Create a new project</p>
          </div>
        </div>

        {!showForm && !preselectedLeadId ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Requirement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <Button onClick={handleFetchLeads}>Fetch</Button>
                </div>
              </div>

              {leads.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Requirement</Label>
                  <div className="space-y-2">
                    {leads.map((lead) => (
                      <Card
                        key={lead.id}
                        className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => handleSelectLead(lead)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.technology} • {lead.platform} • {lead.leadStatus}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {leads.length === 0 && mobile && (
                <div className="text-center p-4">
                  <p className="text-muted-foreground mb-4">No requirements found for this mobile</p>
                  <Button onClick={() => navigate('/leads/create')}>Create Lead</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input value={selectedLead?.mobile} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technology">Technology *</Label>
                  <Input
                    id="technology"
                    value={formData.technology}
                    onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Expected End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProjectStatus.NOT_STARTED}>Not Started</SelectItem>
                      <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                      <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Project Amount (₹) *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description / Scope</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Project'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => preselectedLeadId ? navigate('/projects') : setShowForm(false)}>
                    {preselectedLeadId ? 'Cancel' : 'Back'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
