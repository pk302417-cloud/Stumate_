import type { AdminStats, Report, DataRequest, Profile, UserReport } from '@/types/database';

export const mockAdminStats: AdminStats = {
  total_users: 1284,
  active_listings: 342,
  open_reports: 7,
  open_data_requests: 3,
  total_conversations: 2156,
  banned_users: 4,
  sla_breaches: {
    data_requests: 1,
  },
};

export const mockReports: Report[] = [
  { id: 'r1', reporter_id: 'u2', listing_id: 'listing-3', reason: 'prohibited_item', details: 'This appears to be a prescription medicine listing.', status: 'open', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'r2', reporter_id: 'u3', listing_id: 'listing-7', reason: 'scam', details: 'Seller asked for advance payment via UPI outside the platform.', status: 'open', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'r3', reporter_id: 'u4', listing_id: 'listing-10', reason: 'duplicate', details: 'Same item posted 3 times by the same seller.', status: 'reviewing', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'r4', reporter_id: 'u5', listing_id: 'listing-15', reason: 'wrong_info', details: 'Condition says like new but photos show heavy damage.', status: 'open', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'r5', reporter_id: 'u6', listing_id: 'listing-20', reason: 'other', details: 'Item is priced unreasonably, seems like a joke listing.', status: 'actioned', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
];

export const mockUserReports: UserReport[] = [
  { id: 'ur1', reporter_id: 'u2', reported_id: 's2', conversation_id: 'conv3', reason: 'harassment', details: 'Sending abusive messages after I declined to buy.', status: 'open', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'ur2', reporter_id: 'u3', reported_id: 's1', conversation_id: 'conv1', reason: 'scam', details: 'Tried to get me to pay advance via UPI.', status: 'reviewing', created_at: new Date(Date.now() - 26 * 3600000).toISOString() },
];

export const mockDataRequests: DataRequest[] = [
  { id: 'dr1', user_id: 'u2', type: 'access', details: 'I want a copy of all my data.', status: 'open', acknowledge_due_at: new Date(Date.now() + 12 * 3600000).toISOString(), due_at: new Date(Date.now() + 12 * 86400000).toISOString(), acknowledged_at: null, resolved_at: null, created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: 'dr2', user_id: 'u3', type: 'erasure', details: 'Please delete my account and all associated data.', status: 'in_progress', acknowledge_due_at: new Date(Date.now() - 3600000).toISOString(), due_at: new Date(Date.now() + 11 * 86400000).toISOString(), acknowledged_at: new Date(Date.now() - 20 * 3600000).toISOString(), resolved_at: null, created_at: new Date(Date.now() - 28 * 3600000).toISOString() },
  { id: 'dr3', user_id: 'u4', type: 'grievance', details: 'My account was banned incorrectly.', status: 'open', acknowledge_due_at: new Date(Date.now() + 2 * 3600000).toISOString(), due_at: new Date(Date.now() + 13 * 86400000).toISOString(), acknowledged_at: null, resolved_at: null, created_at: new Date(Date.now() - 22 * 3600000).toISOString() },
];

export const mockAdminUsers: (Profile & { email: string; college_name: string })[] = [
  { id: 's1', email: 'priya@campus.edu', college_id: 'col1', college_name: 'Campus University', full_name: 'Priya Patel', avatar_url: null, hostel: 'A-Block Hostel', graduation_year: 2025, whatsapp: '+919876543211', role: 'student', is_banned: false, banned_at: null, consented_at: new Date().toISOString(), terms_version: '1.0', age_confirmed_18: true, onboarded_at: new Date().toISOString() },
  { id: 's2', email: 'rohan@campus.edu', college_id: 'col1', college_name: 'Campus University', full_name: 'Rohan Verma', avatar_url: null, hostel: 'B-Block Hostel', graduation_year: 2025, whatsapp: '+919876543212', role: 'student', is_banned: false, banned_at: null, consented_at: new Date().toISOString(), terms_version: '1.0', age_confirmed_18: true, onboarded_at: new Date().toISOString() },
  { id: 's3', email: 'sneha@campus.edu', college_id: 'col1', college_name: 'Campus University', full_name: 'Sneha Reddy', avatar_url: null, hostel: 'C-Block Hostel', graduation_year: 2026, whatsapp: '+919876543213', role: 'student', is_banned: true, banned_at: new Date(Date.now() - 3 * 86400000).toISOString(), consented_at: new Date().toISOString(), terms_version: '1.0', age_confirmed_18: true, onboarded_at: new Date().toISOString() },
  { id: 's4', email: 'karthik@campus.edu', college_id: 'col1', college_name: 'Campus University', full_name: 'Karthik Nair', avatar_url: null, hostel: 'D-Block Hostel', graduation_year: 2025, whatsapp: '+919876543214', role: 'student', is_banned: false, banned_at: null, consented_at: new Date().toISOString(), terms_version: '1.0', age_confirmed_18: true, onboarded_at: new Date().toISOString() },
  { id: 'u1', email: 'arjun@campus.edu', college_id: 'col1', college_name: 'Campus University', full_name: 'Arjun Sharma', avatar_url: null, hostel: 'C-Block Hostel', graduation_year: 2026, whatsapp: '+919876543210', role: 'admin', is_banned: false, banned_at: null, consented_at: new Date().toISOString(), terms_version: '1.0', age_confirmed_18: true, onboarded_at: new Date().toISOString() },
];
