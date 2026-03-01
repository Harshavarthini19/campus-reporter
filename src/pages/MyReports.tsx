import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MapPin, Clock, MessageSquare, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getReportsByUserId } from '@/lib/firebaseService';
import { deleteIssue } from '@/lib/storage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MyReports: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchIssues = async () => {
      if (user) {
        setIsLoading(true);
        const firebaseIssues = await getReportsByUserId(user.id);
        setIssues(firebaseIssues);
        setIsLoading(false);
      }
    };
    fetchIssues();
  }, [user, refreshKey]);

  const handleDelete = (e: React.MouseEvent, issueId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this report?')) {
      deleteIssue(issueId);
      toast.success('Report deleted successfully');
      setRefreshKey(prev => prev + 1);
    }
  };

  const filteredIssues = issues
    .filter(issue => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (typeFilter !== 'all' && issue.type !== typeFilter) return false;
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
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      'high': 'px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive',
      'medium': 'px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning',
      'low': 'px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success',
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

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title">My Reports</h1>
            <p className="page-subtitle">Track and manage your submitted issues</p>
          </div>
          <Link to="/report">
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Found</h3>
            <p className="text-muted-foreground mb-6">
              {issues.length === 0
                ? "You haven't submitted any reports yet."
                : 'No reports match your current filters.'}
            </p>
            {issues.length === 0 && (
              <Link to="/report">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Report
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="card-interactive p-6 cursor-pointer"
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{getTypeIcon(issue.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => handleDelete(e, issue.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <span className={getStatusBadge(issue.status)}>
                        {issue.status.replace('-', ' ')}
                      </span>
                      <span className={getPriorityBadge(issue.priority)}>
                        {issue.priority} priority
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {issue.location.name}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(issue.createdAt)}
                      </span>
                      {issue.comments.length > 0 && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          {issue.comments.length} comments
                        </span>
                      )}
                      {issue.isAnonymous && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issue Detail Modal */}
        <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedIssue && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(selectedIssue.type)}</span>
                    {selectedIssue.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Status and Priority */}
                  <div className="flex flex-wrap gap-3">
                    <span className={getStatusBadge(selectedIssue.status)}>
                      {selectedIssue.status.replace('-', ' ')}
                    </span>
                    <span className={getPriorityBadge(selectedIssue.priority)}>
                      {selectedIssue.priority} priority
                    </span>
                    {selectedIssue.isAnonymous && (
                      <span className="status-badge bg-muted text-muted-foreground">
                        Anonymous Report
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedIssue.description}</p>
                  </div>

                  {/* Details */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
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
                    <div>
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <p className="font-medium text-foreground mt-1">{formatDate(selectedIssue.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Comments */}
                  {selectedIssue.comments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-4">Activity</h4>
                      <div className="space-y-4">
                        {selectedIssue.comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-sm font-medium">
                                {comment.userName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
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
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MyReports;
