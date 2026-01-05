import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getIssuesByUserId, getIssues } from '@/lib/storage';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const userIssues = user ? getIssuesByUserId(user.id) : [];
  const allIssues = getIssues();

  const stats = {
    total: userIssues.length,
    pending: userIssues.filter(i => i.status === 'new' || i.status === 'in-progress').length,
    resolved: userIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    highPriority: userIssues.filter(i => i.priority === 'high').length,
  };

  const recentIssues = userIssues
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your campus issues and activity.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/report" className="card-interactive p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Report Issue</h3>
              <p className="text-sm text-muted-foreground">Submit a new report</p>
            </div>
          </Link>

          <Link to="/my-reports" className="card-interactive p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">My Reports</h3>
              <p className="text-sm text-muted-foreground">View all submissions</p>
            </div>
          </Link>

          <div className="card-elevated p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{stats.pending}</h3>
              <p className="text-sm text-muted-foreground">Pending Issues</p>
            </div>
          </div>

          <div className="card-elevated p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{stats.resolved}</h3>
              <p className="text-sm text-muted-foreground">Resolved Issues</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Issues Reported</h3>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground mt-1">All time submissions</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Resolution Rate</h3>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Of your issues resolved</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">High Priority</h3>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.highPriority}</p>
            <p className="text-sm text-muted-foreground mt-1">Urgent issues pending</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Issues</h2>
                <Link to="/my-reports" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recentIssues.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No issues reported yet.</p>
                  <Link to="/report">
                    <Button className="mt-4 btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Report Your First Issue
                    </Button>
                  </Link>
                </div>
              ) : (
                recentIssues.map(issue => (
                  <div key={issue.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getTypeIcon(issue.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{issue.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{issue.location.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={getStatusBadge(issue.status)}>
                            {issue.status.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(issue.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Campus Announcements */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Campus Announcements</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h4 className="font-medium text-foreground">Holiday Schedule Update</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Campus facilities will operate on reduced hours during the winter break. 
                  Please plan accordingly.
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">Dec 20, 2024</span>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                <h4 className="font-medium text-foreground">Maintenance Complete</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Library HVAC system has been repaired. Normal operations have resumed.
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">Dec 15, 2024</span>
              </div>
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                <h4 className="font-medium text-foreground">WiFi Upgrade Scheduled</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Network upgrades planned for Jan 5-6. Expect brief interruptions.
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">Dec 10, 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Access */}
        {user?.role === 'admin' && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Admin Dashboard</h3>
                <p className="text-muted-foreground">
                  {allIssues.filter(i => i.status === 'new').length} new issues require attention
                </p>
              </div>
              <Link to="/admin">
                <Button className="btn-primary">
                  Open Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
