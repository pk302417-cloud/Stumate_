import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { SEMESTERS } from '@/config/academics';
import { Avatar } from '@/components/ui/Avatar';
import { Dialog } from '@/components/ui/Dialog';
import { config } from '@/config';
import { updateProfile, exportMyData, deleteMyAccount } from '@/api';
import { Download, Trash2, LogOut, Shield, Ban, FileText, ChevronRight } from 'lucide-react';
import { cn, isValidMobile, formatLocation } from '@/lib/format';

export function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  if (!profile) return null;

  const tabs = [
    { label: 'Profile', value: 'profile' },
    { label: 'Privacy', value: 'privacy' },
    { label: 'Settings', value: 'settings' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-4">My account</h1>

      {/* Profile card */}
      <Card className="p-4 mb-4 flex items-center gap-4">
        <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-ink-800 dark:text-ink-100">{profile.full_name}</h2>
          {profile.college_name && <p className="text-sm text-ink-500">{profile.college_name}{formatLocation(profile.college_city, profile.college_state) ? ` · ${formatLocation(profile.college_city, profile.college_state)}` : ''}</p>}
          <p className="text-sm text-ink-400">{[profile.course, profile.department, profile.semester ? `Sem ${profile.semester}` : null].filter(Boolean).join(' · ')}</p>
          <p className="text-xs text-ink-400">Class of {profile.graduation_year}{profile.graduation_year <= new Date().getFullYear() ? ' · Senior' : ''}</p>
        </div>
      </Card>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === 'profile' && (
        <ProfileEditForm profile={profile} onSaved={() => show('Profile updated', 'success')} />
      )}

      {activeTab === 'privacy' && (
        <PrivacyCenter
          onDeleteClick={() => setDeleteOpen(true)}
          onDataExport={async () => {
            try {
              const data = await exportMyData();
              const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
              const a = document.createElement('a');
              a.href = url;
              a.download = 'stumate-my-data.json';
              a.click();
              URL.revokeObjectURL(url);
              show('Data downloaded', 'success');
            } catch (err) {
              show(err instanceof Error ? err.message : 'Could not export your data.', 'error');
            }
          }}
        />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-3">Notifications</h3>
            <p className="text-sm text-ink-400">Notification preferences coming in Phase 2.</p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-3">Account</h3>
            <button
              onClick={() => { signOut(); show('Signed out', 'success'); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800"
            >
              <LogOut className="w-5 h-5 text-ink-400" /> Sign out
            </button>
          </Card>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <div className="space-y-4">
          <p className="text-sm text-ink-600 dark:text-ink-300">
            This will permanently delete your account, all your listings, photos, and chat messages.
            This action cannot be undone.
          </p>
          <Input
            label='Type "DELETE" to confirm'
            placeholder="DELETE"
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1">Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteConfirm !== 'DELETE'}
              onClick={async () => {
                try {
                  await deleteMyAccount();
                  await signOut();
                  show('Account deleted', 'success');
                } catch (err) {
                  show(err instanceof Error ? err.message : 'Could not delete your account.', 'error');
                }
              }}
              className="flex-1"
            >
              Delete my account
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function ProfileEditForm({ profile, onSaved }: { profile: NonNullable<ReturnType<typeof useAuth>['profile']>; onSaved: () => void }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [hostel, setHostel] = useState(profile.hostel ?? '');
  const [gradYear, setGradYear] = useState(String(profile.graduation_year));
  const [mobile, setMobile] = useState(profile.whatsapp ?? '');
  const [course, setCourse] = useState(profile.course ?? '');
  const [department, setDepartment] = useState(profile.department ?? '');
  const [semester, setSemester] = useState(profile.semester ? String(profile.semester) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refresh } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (fullName.trim().length < 2) return setError('Please enter your name.');
    if (mobile && !isValidMobile(mobile)) return setError('Enter a valid 10-digit mobile number.');
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        hostel: hostel.trim(),
        graduation_year: parseInt(gradYear),
        whatsapp: mobile || null,
        course: course.trim() || null,
        department: department.trim() || null,
        semester: semester ? Number(semester) : null,
      });
      await refresh();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSave} className="space-y-4">
        <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={80} />
        <Input label="Mobile number" value={mobile} onChange={e => setMobile(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 16))} inputMode="tel" hint="Shared only after you start a chat" />
        <Input label="Course" value={course} onChange={e => setCourse(e.target.value)} maxLength={60} />
        <Input label="Department" value={department} onChange={e => setDepartment(e.target.value)} maxLength={60} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Semester" value={semester} onChange={e => setSemester(e.target.value)}>
            <option value="">Select</option>
            {SEMESTERS.map(n => <option key={n} value={n}>Sem {n}</option>)}
          </Select>
          <Input label="Graduation year" value={gradYear} onChange={e => setGradYear(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" />
        </div>
        <Input label="Hostel / area" value={hostel} onChange={e => setHostel(e.target.value)} maxLength={80} />
        {error && <p className="text-sm text-error-500">{error}</p>}
        <Button type="submit" loading={loading}>Save changes</Button>
      </form>
    </Card>
  );
}

function PrivacyCenter({ onDeleteClick, onDataExport }: { onDeleteClick: () => void; onDataExport: () => void | Promise<void> }) {
  const [consents, setConsents] = useState({
    whatsappSharing: false,
    analytics: false,
    marketing: false,
  });

  const consentItems = [
    { key: 'whatsappSharing' as const, label: 'Share WhatsApp number with chat partners', desc: 'After a conversation starts on a listing' },
    { key: 'analytics' as const, label: 'Anonymous usage analytics', desc: 'Help us improve the app' },
    { key: 'marketing' as const, label: 'Product updates and tips', desc: 'Occasional emails about new features' },
  ];

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-500" /> Consent preferences
        </h3>
        <div className="space-y-3">
          {consentItems.map(item => (
            <label key={item.key} className="flex items-start gap-3 p-3 rounded-xl border border-ink-200 dark:border-ink-700 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800">
              <input
                type="checkbox"
                checked={consents[item.key]}
                onChange={e => setConsents({ ...consents, [item.key]: e.target.checked })}
                className="mt-0.5 w-5 h-5 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
              />
              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.label}</p>
                <p className="text-xs text-ink-400">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-3">Data & privacy</h3>
        <div className="space-y-1">
          <ActionRow icon={<Download className="w-5 h-5 text-brand-500" />} label="Download my data" desc="Export your account data as JSON" onClick={onDataExport} />
          <ActionRow icon={<FileText className="w-5 h-5 text-ink-400" />} label="Raise a request" desc="Access, correction, erasure, or grievance" />
          <ActionRow icon={<Ban className="w-5 h-5 text-ink-400" />} label="Blocked users" desc="Manage users you've blocked" />
          <ActionRow icon={<Trash2 className="w-5 h-5 text-error-500" />} label="Delete my account" desc="Permanently erase all your data" onClick={onDeleteClick} danger />
        </div>
      </Card>
    </div>
  );
}

function ActionRow({ icon, label, desc, onClick, danger }: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
        danger ? 'hover:bg-error-50 dark:hover:bg-error-900/20' : 'hover:bg-ink-50 dark:hover:bg-ink-800'
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className={cn('text-sm font-medium', danger ? 'text-error-600 dark:text-error-400' : 'text-ink-700 dark:text-ink-200')}>{label}</p>
        <p className="text-xs text-ink-400">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-ink-300 flex-shrink-0" />
    </button>
  );
}
