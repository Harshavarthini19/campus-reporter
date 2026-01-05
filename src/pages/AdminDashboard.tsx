import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Users, FileText, AlertTriangle, CheckCircle2, Clock, TrendingUp, 
  Filter, Search, MapPin, MessageSquare, ChevronDown, BarChart3,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getIssues, getUsers, updateIssue, addComment, Issue, getUserById, createNotification } from '@/lib/storage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [replyContent, setReplyContent] = useState('');

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const issues = getIssues();
  const users = getUsers();

  const stats = {
    total: issues.length,
    new: issues.filter(i => i.status === 'new').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    highPriority: issues.filter(i => i.priority === 'high' && i.status !== 'resolved' && i.status !== 'closed').length,
  };

  const filteredIssues = issues
    .filter(issue => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (typeFilter !== 'all' && issue.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.location.name.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by priority first, then by date
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'new': 'status-badge status-new',
      'in-progress': 'status-badge status-in-progress',
      'under-review': 'status-badge status-in-progress',
      'resolved': 'status-badge status-resolved',
      'closed': 'status-badge status-closed',
    };
    return styles[status] || 'status-badge';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      'high': 'px-2 py-1 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20',
      'medium': 'px-2 py-1 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/20',
      'low': 'px-2 py-1 rounded text-xs font-medium bg-success/10 text-success border border-success/20',
    };
    return styles[priority] || '';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      infrastructure: '🏗️',
      harassment: '⚠️',
      technical: '💻',
      suggestion: '💡',
    };
    return icons[type] || '📋';
  };

  const handleStatusChange = (issueId: string, newStatus: Issue['status']) => {
    const updated = updateIssue(issueId, { status: newStatus });
    if (updated) {
      // Notify user
      createNotification({
        userId: updated.userId,
        title: 'Status Updated',
        message: `Your issue "${updated.title}" status has been changed to ${newStatus.replace('-', ' ')}.`,
        type: 'info',
        isRead: false,
        issueId: updated.id,
      });

      toast({
        title: 'Status Updated',
        description: `Issue status changed to ${newStatus.replace('-', ' ')}`,
      });

      if (selectedIssue?.id === issueId) {
        setSelectedIssue(updated);
      }
    }
  };

  const handleAddReply = () => {
    if (!selectedIssue || !replyContent.trim() || !user) return;

    const updated = addComment(selectedIssue.id, {
      userId: user.id,
      userName: user.name,
      content: replyContent,
      isInternal: false,
    });

    if (updated) {
      createNotification({
        userId: updated.userId,
        title: 'New Response',
        message: `An administrator has responded to your issue "${updated.title}".`,
        type: 'info',
        isRead: false,
        issueId: updated.id,
      });

      setSelectedIssue(updated);
      setReplyContent('');
      toast({
        title: 'Reply Added',
        description: 'Your response has been posted.',
      });
    }
  };

  const getReporterName = (issue: Issue) => {
    if (issue.isAnonymous) return 'Anonymous';
    const reporter = getUserById(issue.userId);
    return reporter?.name || 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to campus issues
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-success flex items-center">
                <ArrowUpRight className="h-3 w-3" /> 12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Issues</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary mt-2">{stats.new}</p>
            <p className="text-sm text-muted-foreground">New Issues</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning mt-2">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success mt-2">{stats.resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive mt-2">{stats.highPriority}</p>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="under-review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="all">All Types</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="harassment">Harassment</option>
                <option value="technical">Technical</option>
                <option value="suggestion">Suggestion</option>
              </select>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Issue</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Reporter</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIssues.map(issue => (
                  <tr
                    key={issue.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTypeIcon(issue.type)}</span>
                        <div>
                          <p className="font-medium text-foreground">{issue.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">{issue.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {getReporterName(issue)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {issue.location.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getPriorityBadge(issue.priority)}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(issue.status)}>
                        {issue.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Update <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'new')}>
                            Mark as New
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'in-progress')}>
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'under-review')}>
                            Mark as Under Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'resolved')}>
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'closed')}>
                            Mark as Closed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredIssues.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No issues match your filters.</p>
            </div>
          )}
        </div>

        {/* Issue Detail Modal */}
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedIssue && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(selectedIssue.type)}</span>
                    {selectedIssue.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3">
                    <span className={getStatusBadge(selectedIssue.status)}>
                      {selectedIssue.status.replace('-', ' ')}
                    </span>
                    <span className={getPriorityBadge(selectedIssue.priority)}>
                      {selectedIssue.priority} priority
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Change Status <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedIssue.id, 'in-progress')}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedIssue.id, 'under-review')}>
                          Under Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedIssue.id, 'resolved')}>
                          Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedIssue.id, 'closed')}>
                          Closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedIssue.description}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Reporter</span>
                      <p className="font-medium text-foreground mt-1">{getReporterName(selectedIssue)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Location</span>
                      <p className="font-medium text-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {selectedIssue.location.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Type</span>
                      <p className="font-medium text-foreground capitalize mt-1">{selectedIssue.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Created</span>
                      <p className="font-medium text-foreground mt-1">{formatDate(selectedIssue.createdAt)}</p>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium text-foreground mb-4">Activity & Comments</h4>
                    {selectedIssue.comments.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {selectedIssue.comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-sm font-medium">
                                {comment.userName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-foreground">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-muted-foreground">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground mb-4">No comments yet.</p>
                    )}

                    {/* Reply Form */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a response to the reporter..."
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        className="form-textarea"
                      />
                      <Button
                        className="btn-primary"
                        onClick={handleAddReply}
                        disabled={!replyContent.trim()}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
