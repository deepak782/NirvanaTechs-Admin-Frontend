import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getLeadById, updateLead } from '@/api/leads';
import { useToast } from '@/hooks/use-toast';
import { FollowupStatus, LeadStatus, LeadBudget, UpdateLeadDto } from '@/types';
import Select from 'react-select';

const technologyOptions = [
  { value: 'Flutter', label: 'Flutter' },
  { value: 'React Native', label: 'React Native' },
  { value: 'React.js', label: 'React.js' },
  { value: 'Node.js', label: 'Node.js' },
  { value: 'Python', label: 'Python' },
  { value: 'Java', label: 'Java' },
  { value: '.NET', label: '.NET' },
  { value: 'Other', label: 'Other' },
];

const platformOptions = [
  { value: 'iOS', label: 'iOS' },
  { value: 'Android', label: 'Android' },
  { value: 'Web', label: 'Web' },
  { value: 'Desktop', label: 'Desktop' },
  { value: 'Cross-Platform', label: 'Cross-Platform' },
];

const leadSourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Direct Contact', label: 'Direct Contact' },
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'Other', label: 'Other' },
];

export default function EditLead() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<UpdateLeadDto>({
    name: '',
    mobile: '',
    email: '',
    whatsapp: '',
    technology: '',
    platform: '',
    receivedDate: '',
    leadSource: '',
    followupStatus: FollowupStatus.PENDING,
    followupDate: '',
    budget: LeadBudget.LT_1_LAKH,
    leadStatus: LeadStatus.NEW,
    description: '',
  });

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLeadById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        mobile: lead.mobile,
        email: lead.email || '',
        whatsapp: lead.whatsapp || '',
        technology: lead.technology,
        platform: lead.platform || '',
        receivedDate: lead.receivedDate?.split('T')[0] || '',
        leadSource: lead.leadSource,
        followupStatus: lead.followupStatus,
        followupDate: lead.followupDate?.split('T')[0] || '',
        budget: lead.budget,
        leadStatus: lead.leadStatus,
        description: lead.description || '',
      });
    }
  }, [lead]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeadDto) => updateLead(id!, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lead updated successfully',
      });
      navigate(`/leads/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update lead',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/leads/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Lead</h1>
            <p className="text-muted-foreground mt-2">Update lead information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Requirement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Technology *</Label>
                  <Select
                    options={technologyOptions}
                    value={technologyOptions.find(opt => opt.value === formData.technology)}
                    onChange={(option) => setFormData({ ...formData, technology: option?.value || '' })}
                  />
                </div>
                <div>
                  <Label>Platform</Label>
                  <Select
                    options={platformOptions}
                    value={platformOptions.find(opt => opt.value === formData.platform)}
                    onChange={(option) => setFormData({ ...formData, platform: option?.value || '' })}
                  />
                </div>
                <div>
                  <Label htmlFor="receivedDate">Received Date *</Label>
                  <Input
                    id="receivedDate"
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Lead Source *</Label>
                  <Select
                    options={leadSourceOptions}
                    value={leadSourceOptions.find(opt => opt.value === formData.leadSource)}
                    onChange={(option) => setFormData({ ...formData, leadSource: option?.value || '' })}
                  />
                </div>
                <div>
                  <Label>Followup Status *</Label>
                  <Select
                    options={Object.values(FollowupStatus).map(val => ({ value: val, label: val }))}
                    value={{ value: formData.followupStatus, label: formData.followupStatus }}
                    onChange={(option) => setFormData({ ...formData, followupStatus: option?.value as FollowupStatus })}
                  />
                </div>
                <div>
                  <Label htmlFor="followupDate">Followup Date</Label>
                  <Input
                    id="followupDate"
                    type="date"
                    value={formData.followupDate}
                    onChange={(e) => setFormData({ ...formData, followupDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Budget *</Label>
                  <Select
                    options={Object.values(LeadBudget).map(val => ({ value: val, label: val }))}
                    value={{ value: formData.budget, label: formData.budget }}
                    onChange={(option) => setFormData({ ...formData, budget: option?.value as LeadBudget })}
                  />
                </div>
                <div>
                  <Label>Lead Status *</Label>
                  <Select
                    options={Object.values(LeadStatus).map(val => ({ value: val, label: val }))}
                    value={{ value: formData.leadStatus, label: formData.leadStatus }}
                    onChange={(option) => setFormData({ ...formData, leadStatus: option?.value as LeadStatus })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate(`/leads/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
