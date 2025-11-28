import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Eye, Edit, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/api/projects';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { ProjectStatus } from '@/types';

export default function ProjectsList() {
  const navigate = useNavigate();
  const [searchMobile, setSearchMobile] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
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

  const filteredProjects = projects.filter(project => {
    const matchesMobile = !searchMobile || project.mobile.includes(searchMobile);
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesMobile && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-2">Manage your IT service projects</p>
          </div>
          <Button onClick={() => navigate('/projects/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
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
                  <SelectItem value={ProjectStatus.NOT_STARTED}>Not Started</SelectItem>
                  <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading projects...
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No projects found</p>
              <Button onClick={() => navigate('/projects/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Project Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Client Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Mobile</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Technology</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Start Date</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Total Amount</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Received</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Balance</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-4 font-medium">{project.name}</td>
                        <td className="p-4">{project.clientName}</td>
                        <td className="p-4">{project.mobile}</td>
                        <td className="p-4">{project.technology || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                            {project.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4">{formatDate(project.startDate)}</td>
                        <td className="p-4 text-right">{formatCurrency(project.totalAmount)}</td>
                        <td className="p-4 text-right">{formatCurrency(project.amountReceived || 0)}</td>
                        <td className="p-4 text-right font-medium">{formatCurrency(project.balanceAmount || 0)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/projects/${project.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/projects/${project.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
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
