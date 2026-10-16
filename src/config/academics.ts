// Options shown in the sign-up details form. "Other" lets students type their own.
export const OTHER = 'Other';

export const COURSES = [
  'B.Tech / B.E.',
  'M.Tech / M.E.',
  'B.Sc',
  'M.Sc',
  'BCA',
  'MCA',
  'B.Com',
  'M.Com',
  'BBA',
  'MBA',
  'BA',
  'MA',
  'B.Arch',
  'B.Des',
  'MBBS',
  'BDS',
  'B.Pharm',
  'LLB',
  'Integrated (5-year) programme',
  'Ph.D',
  'Diploma',
  OTHER,
] as const;

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biotechnology',
  'Metallurgy & Materials',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Life Sciences',
  'Economics',
  'Commerce',
  'Management',
  'Law',
  'Medicine',
  'Pharmacy',
  'Architecture',
  'Design',
  'Humanities & Social Sciences',
  OTHER,
] as const;

export const SEMESTERS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Graduation years offered in the form: this year up to 7 years ahead. */
export function graduationYears(now = new Date()): number[] {
  const start = now.getFullYear();
  return Array.from({ length: 8 }, (_, i) => start + i);
}
