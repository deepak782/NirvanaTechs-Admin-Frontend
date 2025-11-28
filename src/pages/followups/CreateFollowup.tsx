import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFollowup } from '@/api/followups';
import { getLeadsByMobile } from '@/api/leads';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { FollowupStatus, Lead } from '@/types';

export default function CreateFollowup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobile, setMobile] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    followupDate: '',
    status: FollowupStatus.PENDING,
    notes: '',
    nextFollowupDate: '',
  });

  const { data: leads = [], refetch: fetchLeads } = useQuery({
    queryKey: ['leads-by-mobile', mobile],
    queryFn: () => getLeadsByMobile(mobile),
    enabled: false,
  });

  const createMutation = useMutation({
    mutationFn: createFollowup,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Follow-up created successfully',
      });
      navigate('/followups');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create follow-up',
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
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    createMutation.mutate({
      leadId: selectedLead.id,
      followupDate: formData.followupDate,
      status: formData.status,
      notes: formData.notes,
      nextFollowupDate: formData.nextFollowupDate || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/followups')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Follow-up</h1>
            <p className="text-muted-foreground mt-1">Schedule a new follow-up</p>
          </div>
        </div>

        {!showForm ? (
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
                            {lead.technology} • {lead.platform} • {lead.leadSource} • {lead.leadStatus}
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
                <CardTitle>Follow-up Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={selectedLead?.name} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input value={selectedLead?.mobile} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Technology</Label>
                  <Input value={selectedLead?.technology} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followupDate">Follow-up Date & Time *</Label>
                  <Input
                    id="followupDate"
                    type="datetime-local"
                    value={formData.followupDate}
                    onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value: FollowupStatus) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FollowupStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={FollowupStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={FollowupStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={FollowupStatus.NOT_INTERESTED}>Not Interested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextFollowupDate">Next Follow-up Date</Label>
                  <Input
                    id="nextFollowupDate"
                    type="date"
                    value={formData.nextFollowupDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowupDate: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Follow-up'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Back
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
