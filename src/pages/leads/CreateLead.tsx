import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createLead, getLeadsByMobile } from '@/api/leads';
import { useToast } from '@/hooks/use-toast';
import { FollowupStatus, LeadStatus, LeadBudget, CreateLeadDto, Lead } from '@/types';
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

export default function CreateLead() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mobile, setMobile] = useState('');
  const [existingLeads, setExistingLeads] = useState<Lead[]>([]);
  const [clientFetched, setClientFetched] = useState(false);
  
  const [formData, setFormData] = useState<CreateLeadDto>({
    name: '',
    mobile: '',
    email: '',
    whatsapp: '',
    technology: '',
    platform: '',
    receivedDate: new Date().toISOString().split('T')[0],
    leadSource: '',
    followupStatus: FollowupStatus.PENDING,
    followupDate: '',
    budget: LeadBudget.LT_1_LAKH,
    leadStatus: LeadStatus.NEW,
    description: '',
  });

  const fetchClientMutation = useMutation({
    mutationFn: getLeadsByMobile,
    onSuccess: (data) => {
      if (data.length > 0) {
        const firstLead = data[0];
        setFormData(prev => ({
          ...prev,
          name: firstLead.name,
          mobile: firstLead.mobile,
          email: firstLead.email || '',
          whatsapp: firstLead.whatsapp || '',
        }));
        setExistingLeads(data);
        toast({
          title: 'Client Found',
          description: `Found ${data.length} existing requirement(s) for this client`,
        });
      } else {
        setFormData(prev => ({ ...prev, mobile }));
        toast({
          title: 'New Client',
          description: 'No existing records found. Please fill in the details.',
        });
      }
      setClientFetched(true);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to fetch client data',
        variant: 'destructive',
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });
      navigate('/leads');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create lead',
        variant: 'destructive',
      });
    },
  });

  const handleFetchClient = () => {
    if (!mobile) {
      toast({
        title: 'Error',
        description: 'Please enter a mobile number',
        variant: 'destructive',
      });
      return;
    }
    fetchClientMutation.mutate(mobile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobile || !formData.technology || !formData.leadSource) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Lead</h1>
            <p className="text-muted-foreground mt-2">Add a new client requirement</p>
          </div>
        </div>

        {!clientFetched && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Fetch Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFetchClient} disabled={fetchClientMutation.isPending}>
                    <Search className="h-4 w-4 mr-2" />
                    Fetch Existing Client
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {clientFetched && (
          <>
            {existingLeads.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Previous Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {existingLeads.map((lead) => (
                      <div key={lead.id} className="p-3 bg-background rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{lead.technology}</p>
                            <p className="text-sm text-muted-foreground">{lead.description}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {lead.leadStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                        placeholder="Client name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile-field">Mobile *</Label>
                      <Input
                        id="mobile-field"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="Mobile number"
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
                        placeholder="client@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="WhatsApp number"
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
                        placeholder="Select technology"
                      />
                    </div>
                    <div>
                      <Label>Platform</Label>
                      <Select
                        options={platformOptions}
                        value={platformOptions.find(opt => opt.value === formData.platform)}
                        onChange={(option) => setFormData({ ...formData, platform: option?.value || '' })}
                        placeholder="Select platform"
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
                        placeholder="Select lead source"
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
                      placeholder="Enter requirement details..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" onClick={() => navigate('/leads')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Lead'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
