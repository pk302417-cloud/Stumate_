import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, GraduationCap, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell } from '@/components/auth/AuthShell';
import { CollegePicker } from '@/components/auth/CollegePicker';
import { checkSignupEmail, sendLoginCode } from '@/api';
import { formatLocation } from '@/lib/format';
import type { CollegeOption } from '@/types/database';

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [college, setCollege] = useState<CollegeOption | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;
    setError('');
    setLoading(true);
    try {
      const addr = email.trim().toLowerCase();
      const check = await checkSignupEmail(addr, college.id);
      if (!check.ok) {
        if (check.reason === 'domain_mismatch') {
          setError(`Use your ${college.name} email (ending with ${check.domains.map(d => '@' + d).join(' or ')}).`);
        } else if (check.reason === 'invalid_email') {
          setError('Please enter a valid email address.');
        } else {
          setError('College not found. Please go back and pick again.');
        }
        return;
      }
      await sendLoginCode(addr, { createUser: true, collegeId: college.id });
      navigate('/verify', { state: { email: addr, collegeId: college.id, mode: 'signup' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell wide>
      <div className="flex items-center gap-2 mb-1 text-xs font-medium text-brand-600">
        <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30">Step {step} of 2</span>
      </div>

      {step === 1 ? (
        <>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-1">Choose your college</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
            You’ll see and trade with students from your campus only.
          </p>
          <CollegePicker value={college} onChange={setCollege} />
          <Button size="lg" className="w-full mt-5" disabled={!college} onClick={() => setStep(2)}>
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-center mt-5 text-sm text-ink-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium">Sign in</Link>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => { setStep(1); setError(''); }}
            className="flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Change college
          </button>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-3">Verify your email</h1>

          {college && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 mb-5">
              <GraduationCap className="w-5 h-5 text-brand-600 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900 dark:text-ink-50">{college.name}</p>
                {formatLocation(college.city, college.state) && (
                  <p className="text-xs text-ink-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {formatLocation(college.city, college.state)}
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder={college?.email_domains?.[0] ? `name@${college.email_domains[0]}` : 'you@example.com'}
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
            <Mail className="w-3.5 h-3.5" /> We’ll email you a 6-digit code to verify your account.
          </p>
        </>
      )}
    </AuthShell>
  );
}
