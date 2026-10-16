import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { sendLoginCode } from '@/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const addr = email.trim().toLowerCase();
      await sendLoginCode(addr, { createUser: false });
      navigate('/verify', { state: { email: addr, mode: 'login' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-2">Welcome back</h1>
      <p className="text-ink-500 dark:text-ink-400 mb-6 text-sm">Sign in with the email you registered with.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@yourcollege.edu"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          error={error || undefined}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send code <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <p className="mt-5 text-xs text-ink-400 flex items-center gap-1.5">
        <Mail className="w-3.5 h-3.5" /> We’ll send a 6-digit code to your email.
      </p>
      <p className="text-center mt-6 text-sm text-ink-400">
        New to Stumate?{' '}
        <Link to="/signup" className="text-brand-600 dark:text-brand-400 font-medium">Create account</Link>
      </p>
    </AuthShell>
  );
}
