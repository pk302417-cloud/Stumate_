import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminStats, fetchReports, fetchUserReports, fetchAdminUsers, fetchDataRequests,
  adminRemoveListing, adminResolveReport, adminResolveUserReport, adminSetBan, adminUpdateDataRequest,
} from '@/api';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { cn, formatRelativeTime, formatPrice } from '@/lib/format';
import { mockListings } from '@/api/mockData';
import {
  Users, Package, Flag, FileText, MessageSquare, Ban, AlertTriangle,
  Search, CheckCircle, XCircle, Trash2, ShieldAlert,
} from 'lucide-react';
import type { Report, DataRequest, UserReport, AdminStats } from '@/types/database';

const adminTabs = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Reports', value: 'reports' },
  { label: 'User Reports', value: 'user_reports' },
  { label: 'Users', value: 'users' },
  { label: 'Data Requests', value: 'data_requests' },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-6 h-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50">Admin Console</h1>
      </div>

      <Tabs tabs={adminTabs} active={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'user_reports' && <UserReportsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'data_requests' && <DataRequestsTab />}
    </div>
  );
}

// ============ Dashboard ============

function DashboardTab() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !stats) return <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />)}</div>;

  const cards = [
    { label: 'Total users', value: stats.total_users, icon: <Users className="w-5 h-5" />, color: 'text-brand-600' },
    { label: 'Active listings', value: stats.active_listings, icon: <Package className="w-5 h-5" />, color: 'text-success-600' },
    { label: 'Open reports', value: stats.open_reports, icon: <Flag className="w-5 h-5" />, color: 'text-warning-600' },
    { label: 'Open data requests', value: stats.open_data_requests, icon: <FileText className="w-5 h-5" />, color: 'text-accent-600' },
    { label: 'Conversations', value: stats.total_conversations, icon: <MessageSquare className="w-5 h-5" />, color: 'text-brand-600' },
    { label: 'Banned users', value: stats.banned_users, icon: <Ban className="w-5 h-5" />, color: 'text-error-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map(card => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={cn('p-2 rounded-lg bg-ink-50 dark:bg-ink-800', card.color)}>{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-ink-900 dark:text-ink-50">{card.value.toLocaleString('en-IN')}</p>
            <p className="text-sm text-ink-400">{card.label}</p>
          </Card>
        ))}
      </div>

      {stats.sla_breaches.data_requests > 0 && (
        <Card className="p-4 border border-error-200 dark:border-error-800">
          <div className="flex items-center gap-2 text-error-600 dark:text-error-400">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">SLA breach warning</p>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            {stats.sla_breaches.data_requests} data request(s) have breached the 24-hour acknowledgement SLA. Review them immediately.
          </p>
        </Card>
      )}
    </div>
  );
}

// ============ Reports ============

function ReportsTab() {
  const { show } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>('open');
  const [actionReport, setActionReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<'remove' | 'dismiss' | 'resolve' | null>(null);
  const [reason, setReason] = useState('');

  const { data: reports, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-reports', statusFilter],
    queryFn: () => fetchReports(statusFilter),
  });

  const removeMutation = useMutation({
    mutationFn: () => adminRemoveListing(actionReport!.listing_id, reason),
    onSuccess: () => { show('Listing removed', 'success'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }); closeAction(); },
    onError: () => show('Could not remove listing', 'error'),
  });

  const resolveMutation = useMutation({
    mutationFn: () => adminResolveReport(actionReport!.id, 'actioned'),
    onSuccess: () => { show('Report actioned', 'success'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }); closeAction(); },
    onError: () => show('Could not resolve report', 'error'),
  });

  const dismissMutation = useMutation({
    mutationFn: () => adminResolveReport(actionReport!.id, 'dismissed'),
    onSuccess: () => { show('Report dismissed', 'success'); queryClient.invalidateQueries({ queryKey: ['admin-reports'] }); closeAction(); },
    onError: () => show('Could not dismiss report', 'error'),
  });

  const closeAction = () => { setActionReport(null); setActionType(null); setReason(''); };
  const listing = actionReport ? mockListings.find(l => l.id === actionReport.listing_id) : null;

  const handleConfirm = () => {
    if (actionType === 'remove') removeMutation.mutate();
    else if (actionType === 'resolve') resolveMutation.mutate();
    else if (actionType === 'dismiss') dismissMutation.mutate();
  };

  const loading = removeMutation.isPending || resolveMutation.isPending || dismissMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['open', 'reviewing', 'actioned', 'dismissed', undefined].map(s => (
          <button key={s ?? 'all'} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 text-sm rounded-full transition-colors',
              statusFilter === s ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200')}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {isError ? <ErrorState onRetry={() => refetch()} /> :
       isLoading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}</div> :
       !reports || reports.length === 0 ? <EmptyState title="No reports" description="No reports match this filter." /> :
       reports.map(report => {
         const rptListing = mockListings.find(l => l.id === report.listing_id);
         return (
           <Card key={report.id} className="p-4" hover={false}>
             <div className="flex items-start justify-between gap-3">
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <Badge variant={report.status === 'open' ? 'warning' : report.status === 'actioned' ? 'success' : 'neutral'}>{report.status}</Badge>
                   <Badge variant="error">{report.reason.replace('_', ' ')}</Badge>
                   <span className="text-xs text-ink-400">{formatRelativeTime(report.created_at)}</span>
                 </div>
                 <p className="text-sm text-ink-600 dark:text-ink-300">{report.details}</p>
                 {rptListing && <p className="text-xs text-brand-600 mt-1">Listing: {rptListing.title} — {formatPrice(rptListing.price_inr)}</p>}
               </div>
               {report.status === 'open' || report.status === 'reviewing' ? (
                 <div className="flex flex-col gap-1.5 flex-shrink-0">
                   <Button size="sm" variant="danger" onClick={() => { setActionReport(report); setActionType('remove'); }}>
                     <Trash2 className="w-3.5 h-3.5" /> Remove listing
                   </Button>
                   <Button size="sm" variant="outline" onClick={() => { setActionReport(report); setActionType('resolve'); }}>
                     <CheckCircle className="w-3.5 h-3.5" /> Action
                   </Button>
                   <Button size="sm" variant="ghost" onClick={() => { setActionReport(report); setActionType('dismiss'); }}>
                     <XCircle className="w-3.5 h-3.5" /> Dismiss
                   </Button>
                 </div>
               ) : null}
             </div>
           </Card>
         );
       })}

      <Dialog open={!!actionReport} onClose={closeAction} title={actionType === 'remove' ? 'Remove listing' : actionType === 'dismiss' ? 'Dismiss report' : 'Mark as actioned'}>
        <div className="space-y-4">
          {listing && actionType === 'remove' && (
            <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800">
              <p className="font-medium text-sm text-ink-700 dark:text-ink-200">{listing.title}</p>
              <p className="text-xs text-ink-400">{formatPrice(listing.price_inr)}</p>
            </div>
          )}
          <p className="text-sm text-ink-600 dark:text-ink-300">
            {actionType === 'remove' ? 'This will remove the listing and notify the seller. Provide a reason:' :
             actionType === 'dismiss' ? 'Are you sure you want to dismiss this report?' :
             'Mark this report as actioned? This indicates you have reviewed and taken appropriate steps.'}
          </p>
          {actionType === 'remove' && (
            <Textarea label="Reason" placeholder="e.g. Item violates prohibited items policy" value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={500} />
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={closeAction} className="flex-1">Cancel</Button>
            <Button variant={actionType === 'remove' ? 'danger' : 'primary'} onClick={handleConfirm} loading={loading}
              disabled={actionType === 'remove' && !reason.trim()} className="flex-1">
              {actionType === 'remove' ? 'Remove listing' : actionType === 'dismiss' ? 'Dismiss' : 'Mark actioned'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

// ============ User Reports ============

function UserReportsTab() {
  const { show } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>('open');
  const [actionReport, setActionReport] = useState<UserReport | null>(null);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss' | null>(null);

  const { data: reports, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-user-reports', statusFilter],
    queryFn: () => fetchUserReports(statusFilter),
  });

  const resolveMutation = useMutation({
    mutationFn: () => adminResolveUserReport(actionReport!.id, 'actioned'),
    onSuccess: () => { show('User report actioned', 'success'); queryClient.invalidateQueries({ queryKey: ['admin-user-reports'] }); closeAction(); },
    onError: () => show('Could not resolve', 'error'),
  });

  const dismissMutation = useMutation({
    mutationFn: () => adminResolveUserReport(actionReport!.id, 'dismissed'),
    onSuccess: () => { show('Report dismissed', 'success'); queryClient.invalidateQueries({ queryKey: ['admin-user-reports'] }); closeAction(); },
    onError: () => show('Could not dismiss', 'error'),
  });

  const closeAction = () => { setActionReport(null); setActionType(null); };
  const handleConfirm = () => {
    if (actionType === 'resolve') resolveMutation.mutate();
    else if (actionType === 'dismiss') dismissMutation.mutate();
  };
  const loading = resolveMutation.isPending || dismissMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['open', 'reviewing', 'actioned', 'dismissed', undefined].map(s => (
          <button key={s ?? 'all'} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 text-sm rounded-full transition-colors',
              statusFilter === s ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200')}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {isError ? <ErrorState onRetry={() => refetch()} /> :
       isLoading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}</div> :
       !reports || reports.length === 0 ? <EmptyState title="No user reports" description="No user reports match this filter." /> :
       reports.map(report => (
         <Card key={report.id} className="p-4" hover={false}>
           <div className="flex items-start justify-between gap-3">
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <Badge variant={report.status === 'open' ? 'warning' : report.status === 'actioned' ? 'success' : 'neutral'}>{report.status}</Badge>
                 <Badge variant="error">{report.reason.replace('_', ' ')}</Badge>
                 <span className="text-xs text-ink-400">{formatRelativeTime(report.created_at)}</span>
               </div>
               <p className="text-sm text-ink-600 dark:text-ink-300">{report.details}</p>
               <p className="text-xs text-ink-400 mt-1">Reported user ID: {report.reported_id}</p>
             </div>
             {(report.status === 'open' || report.status === 'reviewing') && (
               <div className="flex flex-col gap-1.5 flex-shrink-0">
                 <Button size="sm" variant="primary" onClick={() => { setActionReport(report); setActionType('resolve'); }}>
                   <CheckCircle className="w-3.5 h-3.5" /> Action
                 </Button>
                 <Button size="sm" variant="ghost" onClick={() => { setActionReport(report); setActionType('dismiss'); }}>
                   <XCircle className="w-3.5 h-3.5" /> Dismiss
                 </Button>
               </div>
             )}
           </div>
         </Card>
       ))}

      <Dialog open={!!actionReport} onClose={closeAction} title={actionType === 'dismiss' ? 'Dismiss report' : 'Mark as actioned'}>
        <div className="space-y-4">
          <p className="text-sm text-ink-600 dark:text-ink-300">
            {actionType === 'dismiss' ? 'Dismiss this user report?' : 'Mark this user report as actioned? This indicates you have reviewed and taken appropriate steps.'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={closeAction} className="flex-1">Cancel</Button>
            <Button onClick={handleConfirm} loading={loading} className="flex-1">
              {actionType === 'dismiss' ? 'Dismiss' : 'Mark actioned'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

// ============ Users ============

function UsersTab() {
  const { show } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [banUser, setBanUser] = useState<{ id: string; name: string; banned: boolean } | null>(null);
  const [banReason, setBanReason] = useState('');

  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => fetchAdminUsers(search),
  });

  const banMutation = useMutation({
    mutationFn: () => adminSetBan(banUser!.id, !banUser!.banned, banReason),
    onSuccess: () => {
      show(banUser!.banned ? 'User unbanned' : 'User banned', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setBanUser(null); setBanReason('');
    },
    onError: () => show('Could not update ban status', 'error'),
  });

  return (
    <div className="space-y-3">
      <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-md" />

      {isError ? <ErrorState onRetry={() => refetch()} /> :
       isLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div> :
       !users || users.length === 0 ? <EmptyState title="No users found" /> :
       users.map(user => (
         <Card key={user.id} className="p-3 flex items-center gap-3" hover={false}>
           <Avatar name={user.full_name} src={user.avatar_url} size="md" />
           <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
               <p className="font-medium text-ink-800 dark:text-ink-100 truncate">{user.full_name}</p>
               {user.role === 'admin' && <Badge variant="brand">Admin</Badge>}
               {user.is_banned && <Badge variant="error">Banned</Badge>}
             </div>
             <p className="text-xs text-ink-400 truncate">{user.email} · {user.hostel}</p>
           </div>
           {user.role !== 'admin' && (
             <Button size="sm" variant={user.is_banned ? 'outline' : 'danger'}
               onClick={() => setBanUser({ id: user.id, name: user.full_name, banned: user.is_banned })}>
               {user.is_banned ? <><CheckCircle className="w-3.5 h-3.5" /> Unban</> : <><Ban className="w-3.5 h-3.5" /> Ban</>}
             </Button>
           )}
         </Card>
       ))}

      <Dialog open={!!banUser} onClose={() => { setBanUser(null); setBanReason(''); }} title={banUser?.banned ? 'Unban user' : 'Ban user'}>
        <div className="space-y-4">
          <p className="text-sm text-ink-600 dark:text-ink-300">
            {banUser?.banned
              ? `Unban ${banUser?.name}? They will be able to use the app again.`
              : `Ban ${banUser?.name}? They will lose access to the app immediately.`}
          </p>
          {!banUser?.banned && (
            <Textarea label="Reason for ban" placeholder="e.g. Repeated scam attempts" value={banReason} onChange={e => setBanReason(e.target.value)} rows={3} maxLength={500} />
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setBanUser(null); setBanReason(''); }} className="flex-1">Cancel</Button>
            <Button variant={banUser?.banned ? 'primary' : 'danger'} onClick={() => banMutation.mutate()} loading={banMutation.isPending}
              disabled={!banUser?.banned && !banReason.trim()} className="flex-1">
              {banUser?.banned ? 'Unban user' : 'Ban user'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

// ============ Data Requests ============

function DataRequestsTab() {
  const { show } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>('open');
  const [updateReq, setUpdateReq] = useState<DataRequest | null>(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [note, setNote] = useState('');

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-data-requests', statusFilter],
    queryFn: () => fetchDataRequests(statusFilter),
  });

  const updateMutation = useMutation({
    mutationFn: () => adminUpdateDataRequest(updateReq!.id, newStatus, note),
    onSuccess: () => {
      show('Data request updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-data-requests'] });
      setUpdateReq(null); setNote('');
    },
    onError: () => show('Could not update request', 'error'),
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['open', 'in_progress', 'resolved', 'rejected', undefined].map(s => (
          <button key={s ?? 'all'} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 text-sm rounded-full transition-colors',
              statusFilter === s ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200')}>
            {s ? s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {isError ? <ErrorState onRetry={() => refetch()} /> :
       isLoading ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />)}</div> :
       !requests || requests.length === 0 ? <EmptyState title="No data requests" /> :
       requests.map(req => {
         const ackDueMs = new Date(req.acknowledge_due_at).getTime() - Date.now();
         const resolveDueMs = new Date(req.due_at).getTime() - Date.now();
         const ackBreached = ackDueMs < 0 && !req.acknowledged_at;
         const resolveBreached = resolveDueMs < 0 && !req.resolved_at;
         return (
           <Card key={req.id} className="p-4" hover={false}>
             <div className="flex items-start justify-between gap-3">
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <Badge variant="brand">{req.type}</Badge>
                   <Badge variant={req.status === 'open' ? 'warning' : req.status === 'resolved' ? 'success' : 'neutral'}>{req.status.replace('_', ' ')}</Badge>
                   <span className="text-xs text-ink-400">{formatRelativeTime(req.created_at)}</span>
                 </div>
                 <p className="text-sm text-ink-600 dark:text-ink-300">{req.details}</p>
                 <div className="flex flex-wrap gap-3 mt-2 text-xs">
                   {!req.acknowledged_at && (
                     <span className={cn('flex items-center gap-1', ackBreached ? 'text-error-500 font-medium' : 'text-ink-400')}>
                       <AlertTriangle className="w-3 h-3" />
                       {ackBreached ? 'Ack SLA breached' : `Ack due in ${Math.ceil(ackDueMs / 3600000)}h`}
                     </span>
                   )}
                   {req.acknowledged_at && !req.resolved_at && (
                     <span className={cn('flex items-center gap-1', resolveBreached ? 'text-error-500 font-medium' : 'text-ink-400')}>
                       <AlertTriangle className="w-3 h-3" />
                       {resolveBreached ? 'Resolution SLA breached' : `Resolve in ${Math.ceil(resolveDueMs / 86400000)}d`}
                     </span>
                   )}
                   {req.acknowledged_at && <span className="text-success-500">Acknowledged</span>}
                   {req.resolved_at && <span className="text-success-500">Resolved</span>}
                 </div>
               </div>
               {req.status !== 'resolved' && req.status !== 'rejected' && (
                 <Button size="sm" variant="outline" onClick={() => { setUpdateReq(req); setNewStatus(req.status === 'open' ? 'in_progress' : 'resolved'); }}>
                   Update
                 </Button>
               )}
             </div>
           </Card>
         );
       })}

      <Dialog open={!!updateReq} onClose={() => { setUpdateReq(null); setNote(''); }} title="Update data request">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Textarea label="Note" placeholder="Add a note about this update..." value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={500} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setUpdateReq(null); setNote(''); }} className="flex-1">Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} loading={updateMutation.isPending} className="flex-1">Update</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
