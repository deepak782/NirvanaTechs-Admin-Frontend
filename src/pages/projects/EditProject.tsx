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
import { getProjectById, updateProject } from '@/api/projects';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { ProjectStatus } from '@/types';

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

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

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        clientName: project.clientName,
        technology: project.technology || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        status: project.status,
        totalAmount: project.totalAmount.toString(),
        description: project.description || '',
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      navigate(`/projects/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      status: formData.status,
      totalAmount: parseFloat(formData.totalAmount),
      description: formData.description || undefined,
    });
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
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
            <p className="text-muted-foreground mt-1">Update project details</p>
          </div>
        </div>

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
                <Input value={project.mobile} disabled />
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
                  <Label htmlFor="endDate">End Date</Label>
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
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Project'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/projects/${id}`)}>
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
