import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/components/ui/BrandMark';
import { completeOnboarding } from '@/api';
import { COURSES, DEPARTMENTS, OTHER, SEMESTERS, graduationYears } from '@/config/academics';
import { isValidMobile, formatLocation } from '@/lib/format';

const steps = ['About you', 'Your studies', 'Consents'] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { account, refresh } = useAuth();
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [hostel, setHostel] = useState('');
  const [course, setCourse] = useState('');
  const [courseOther, setCourseOther] = useState('');
  const [department, setDepartment] = useState('');
  const [departmentOther, setDepartmentOther] = useState('');
  const [semester, setSemester] = useState('');
  const [gradYear, setGradYear] = useState('');

  const [consents, setConsents] = useState({
    terms: false,
    age18: false,
    whatsappSharing: false,
    analytics: false,
    marketing: false,
  });

  const finalCourse = course === OTHER ? courseOther.trim() : course;
  const finalDept = department === OTHER ? departmentOther.trim() : department;

  const stepValid = (() => {
    if (step === 0) return fullName.trim().length >= 2 && isValidMobile(mobile);
    if (step === 1) return finalCourse.length >= 2 && finalDept.length >= 2 && !!semester && !!gradYear;
    if (step === 2) return consents.terms && consents.age18;
    return false;
  })();

  const handleNext = async () => {
    if (step < 2) {
      setStep(s => s + 1);
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding(
        {
          full_name: fullName.trim(),
          mobile,
          course: finalCourse,
          department: finalDept,
          semester: Number(semester),
          graduation_year: Number(gradYear),
          hostel: hostel.trim(),
          consents,
        },
        account?.current_terms_version ?? '1.0',
      );
      await refresh();
      navigate('/start', { replace: true });
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not save your details. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-ink-50 dark:bg-ink-950">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 justify-center mb-4">
            <BrandMark className="w-10 h-10" />
            <span className="font-display font-extrabold text-2xl tracking-tight text-ink-900 dark:text-ink-50">Stumate</span>
          </div>

          {account?.college_name && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500 mb-5 text-center">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              {account.college_name}
              {formatLocation(account.college_city, account.college_state) && ` · ${formatLocation(account.college_city, account.college_state)}`}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < step ? 'bg-success-500 text-white' :
                  i === step ? 'bg-brand-600 text-white' :
                  'bg-ink-200 dark:bg-ink-700 text-ink-400'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-success-500' : 'bg-ink-200 dark:bg-ink-700'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-card p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-ink-900 dark:text-ink-50">Tell us about you</h1>
                <Input label="Full name" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={80} autoComplete="name" />
                <Input
                  label="Mobile number"
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 16))}
                  inputMode="tel"
                  autoComplete="tel"
                  hint="Shared only with a buyer/seller after you chat on a listing — never public."
                  error={mobile && !isValidMobile(mobile) ? 'Enter a valid 10-digit mobile number' : undefined}
                />
                <Input label="Hostel / area (optional)" placeholder="e.g. C-Block Hostel" value={hostel} onChange={e => setHostel(e.target.value)} maxLength={80} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-ink-900 dark:text-ink-50">Your studies</h1>
                <Select label="Course" value={course} onChange={e => setCourse(e.target.value)}>
                  <option value="">Select course</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                {course === OTHER && <Input placeholder="Type your course" value={courseOther} onChange={e => setCourseOther(e.target.value)} maxLength={60} />}
                <Select label="Department" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
                {department === OTHER && <Input placeholder="Type your department" value={departmentOther} onChange={e => setDepartmentOther(e.target.value)} maxLength={60} />}
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Current semester" value={semester} onChange={e => setSemester(e.target.value)}>
                    <option value="">Select</option>
                    {SEMESTERS.map(n => <option key={n} value={n}>Sem {n}</option>)}
                  </Select>
                  <Select label="Graduating in" value={gradYear} onChange={e => setGradYear(e.target.value)}>
                    <option value="">Select</option>
                    {graduationYears().map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-ink-900 dark:text-ink-50">Privacy & consents</h1>
                <p className="text-sm text-ink-500 dark:text-ink-400">
                  Please review and choose your preferences. No boxes are pre-ticked.
                </p>
                <div className="space-y-3">
                  <ConsentRow required checked={consents.terms} onChange={v => setConsents({ ...consents, terms: v })} label="I agree to the Terms of Service and Privacy Policy" link="/terms" />
                  <ConsentRow required checked={consents.age18} onChange={v => setConsents({ ...consents, age18: v })} label="I confirm I am 18 years or older" />
                  <ConsentRow checked={consents.whatsappSharing} onChange={v => setConsents({ ...consents, whatsappSharing: v })} label="Share my mobile/WhatsApp number with a buyer/seller only after we start a chat" />
                  <ConsentRow checked={consents.analytics} onChange={v => setConsents({ ...consents, analytics: v })} label="Allow anonymous usage analytics to help improve the app" />
                  <ConsentRow checked={consents.marketing} onChange={v => setConsents({ ...consents, marketing: v })} label="Send me occasional product updates and tips" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={!stepValid || loading} loading={loading} className="flex-1">
                {step < 2 ? <>Next <ArrowRight className="w-4 h-4" /></> : 'Save & continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentRow({ checked, onChange, label, required, link }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  required?: boolean;
  link?: string;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border border-ink-200 dark:border-ink-700 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-5 h-5 rounded border-ink-300 text-brand-600 focus:ring-brand-400 cursor-pointer"
      />
      <span className="text-sm text-ink-700 dark:text-ink-200">
        {label}
        {required && <span className="text-error-500 font-medium"> (required)</span>}
        {link && (
          <> — <a href={link} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 underline">read it</a></>
        )}
      </span>
    </label>
  );
}
