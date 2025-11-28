import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, CheckCircle, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFollowups, markFollowupCompleted } from '@/api/followups';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { FollowupStatus } from '@/types';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function FollowupsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchMobile, setSearchMobile] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: followups = [], isLoading } = useQuery({
    queryKey: ['followups'],
    queryFn: getFollowups,
  });

  const markCompletedMutation = useMutation({
    mutationFn: markFollowupCompleted,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast({
        title: 'Success',
        description: 'Follow-up marked as completed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update follow-up',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: FollowupStatus) => {
    switch (status) {
      case FollowupStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-500';
      case FollowupStatus.IN_PROGRESS:
        return 'bg-blue-500/10 text-blue-500';
      case FollowupStatus.COMPLETED:
        return 'bg-green-500/10 text-green-500';
      case FollowupStatus.NOT_INTERESTED:
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredFollowups = followups.filter(followup => {
    const matchesMobile = !searchMobile || followup.mobile.includes(searchMobile);
    const matchesStatus = statusFilter === 'ALL' || followup.status === statusFilter;
    const matchesDate = isSameDay(new Date(followup.followupDate), selectedDate);
    return matchesMobile && matchesStatus && matchesDate;
  });

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Follow-ups</h1>
            <p className="text-muted-foreground mt-2">Manage client follow-ups</p>
          </div>
          <Button onClick={() => navigate('/followups/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Follow-up
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Date Navigation */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousDay}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "min-w-[240px] justify-center font-semibold text-base",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "dd-MMMM-yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextDay}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleToday}
                  className="ml-2"
                >
                  Today
                </Button>
              </div>

              {/* Search and Status Filters */}
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
                    <SelectItem value={FollowupStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={FollowupStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={FollowupStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={FollowupStatus.NOT_INTERESTED}>Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading follow-ups...
            </CardContent>
          </Card>
        ) : filteredFollowups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No follow-ups found</p>
              <Button onClick={() => navigate('/followups/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Follow-up
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
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Mobile</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Technology</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Follow-up Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Notes</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFollowups.map((followup) => (
                      <tr key={followup.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-4 font-medium">{followup.name}</td>
                        <td className="p-4">{followup.mobile}</td>
                        <td className="p-4">{followup.technology || '-'}</td>
                        <td className="p-4">{formatDateTime(followup.followupDate)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(followup.status)}`}>
                            {followup.status}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs truncate">{followup.notes || '-'}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {followup.status === FollowupStatus.PENDING && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markCompletedMutation.mutate(followup.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/followups/${followup.id}/edit`)}
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
