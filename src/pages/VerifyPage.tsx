import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { config } from '@/config';
import { sendLoginCode, verifyLoginCode } from '@/api';
import { useAuth } from '@/hooks/useAuth';

interface VerifyState {
  email?: string;
  collegeId?: string;
  mode?: 'signup' | 'login';
}

export function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const { email = '', collegeId, mode = 'login' } = (location.state as VerifyState | null) ?? {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendTimer, setResendTimer] = useState(config.otpResendSeconds);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  if (!email) return <Navigate to="/signup" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyLoginCode(email, code, collegeId);
      await refresh();
      // Guards send new users to /onboarding and returning users to /start.
      navigate('/start', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setInfo('');
    try {
      await sendLoginCode(email, { createUser: mode === 'signup', collegeId });
      setResendTimer(config.otpResendSeconds);
      setInfo('A new code has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    }
  };

  return (
    <AuthShell>
      <Link to={mode === 'signup' ? '/signup' : '/login'} className="flex items-center gap-1 text-ink-400 hover:text-ink-600 mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-2">Enter the code</h1>
      <p className="text-ink-500 dark:text-ink-400 mb-6 text-sm">
        We sent a 6-digit code to <span className="font-medium text-ink-700 dark:text-ink-200">{email}</span>. Check spam if you don’t see it.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Verification code"
          placeholder="123456"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
          required
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          className="text-center text-2xl tracking-[0.4em] font-bold"
          error={error || undefined}
          hint={info || undefined}
        />
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={code.length < 6}>
          Verify & continue
        </Button>
      </form>
      <div className="mt-6 text-center">
        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="text-sm text-brand-600 dark:text-brand-400 font-medium disabled:text-ink-400 disabled:cursor-not-allowed"
        >
          {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
        </button>
      </div>
    </AuthShell>
  );
}
