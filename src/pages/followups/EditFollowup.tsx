import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFollowupById, updateFollowup } from '@/api/followups';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { FollowupStatus } from '@/types';

export default function EditFollowup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: followup, isLoading } = useQuery({
    queryKey: ['followup', id],
    queryFn: () => getFollowupById(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    followupDate: '',
    status: FollowupStatus.PENDING,
    notes: '',
    nextFollowupDate: '',
  });

  useEffect(() => {
    if (followup) {
      setFormData({
        followupDate: followup.followupDate ? new Date(followup.followupDate).toISOString().slice(0, 16) : '',
        status: followup.status,
        notes: followup.notes || '',
        nextFollowupDate: followup.nextFollowupDate ? new Date(followup.nextFollowupDate).toISOString().split('T')[0] : '',
      });
    }
  }, [followup]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateFollowup(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['followup', id] });
      toast({
        title: 'Success',
        description: 'Follow-up updated successfully',
      });
      navigate('/followups');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update follow-up',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      followupDate: formData.followupDate,
      status: formData.status,
      notes: formData.notes,
      nextFollowupDate: formData.nextFollowupDate || undefined,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!followup) {
    return (
      <DashboardLayout>
        <div className="text-center p-8">Follow-up not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/followups')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Follow-up</h1>
            <p className="text-muted-foreground mt-1">Update follow-up details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={followup.name} disabled />
              </div>

              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={followup.mobile} disabled />
              </div>

              <div className="space-y-2">
                <Label>Technology</Label>
                <Input value={followup.technology || '-'} disabled />
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
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Follow-up'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/followups')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
