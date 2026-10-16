import type { Listing, Category, Profile, Conversation, Message, CollegeOption } from '@/types/database';

// Same names and slugs as the real `categories` table.
export const mockCategories: Category[] = [
  { id: 'cat1', name: 'Furniture', slug: 'furniture', sort_order: 1 },
  { id: 'cat3', name: 'Electronics', slug: 'electronics', sort_order: 2 },
  { id: 'cat2', name: 'Books', slug: 'books', sort_order: 3 },
  { id: 'cat4', name: 'Appliances', slug: 'appliances', sort_order: 4 },
  { id: 'cat9', name: 'Bedding', slug: 'bedding', sort_order: 5 },
  { id: 'cat5', name: 'Kitchen', slug: 'kitchen', sort_order: 6 },
  { id: 'cat7', name: 'Home Decor', slug: 'home-decor', sort_order: 7 },
  { id: 'cat6', name: 'Stationery', slug: 'stationery', sort_order: 8 },
  { id: 'cat10', name: 'Lab & Engineering', slug: 'lab-engineering', sort_order: 9 },
  { id: 'cat11', name: 'Sports & Fitness', slug: 'sports-fitness', sort_order: 10 },
  { id: 'cat12', name: 'Cycles', slug: 'cycles', sort_order: 11 },
  { id: 'cat8', name: 'Other', slug: 'other', sort_order: 99 },
];

export const mockColleges: CollegeOption[] = [
  { id: 'col1', name: 'IIT Bombay', city: 'Mumbai', state: 'Maharashtra', email_domains: [] },
  { id: 'col2', name: 'IIT Delhi', city: 'New Delhi', state: 'Delhi', email_domains: [] },
  { id: 'col3', name: 'IIT Madras', city: 'Chennai', state: 'Tamil Nadu', email_domains: [] },
  { id: 'col4', name: 'NIT Warangal', city: 'Warangal', state: 'Telangana', email_domains: [] },
  { id: 'col5', name: 'BITS Pilani, Pilani Campus', city: 'Pilani', state: 'Rajasthan', email_domains: [] },
  { id: 'col6', name: 'VIT Vellore', city: 'Vellore', state: 'Tamil Nadu', email_domains: [] },
  { id: 'col7', name: 'Delhi Technological University', city: 'New Delhi', state: 'Delhi', email_domains: [] },
  { id: 'col8', name: 'College of Engineering Pune (COEP Tech)', city: 'Pune', state: 'Maharashtra', email_domains: [] },
  { id: 'col9', name: 'Lovely Professional University', city: 'Phagwara', state: 'Punjab', email_domains: [] },
  { id: 'col10', name: 'RV College of Engineering', city: 'Bengaluru', state: 'Karnataka', email_domains: [] },
  { id: 'col11', name: 'Jadavpur University', city: 'Kolkata', state: 'West Bengal', email_domains: ['jadavpuruniversity.in'] },
  { id: 'col12', name: 'Manipal Institute of Technology', city: 'Manipal', state: 'Karnataka', email_domains: [] },
];

export const mockProfile: Profile = {
  id: 'user1',
  college_id: 'col1',
  full_name: 'Arjun Sharma',
  avatar_url: null,
  hostel: 'C-Block Hostel',
  graduation_year: 2026,
  whatsapp: '+919876543210',
  role: 'student',
  is_banned: false,
  banned_at: null,
  consented_at: new Date().toISOString(),
  terms_version: '1.0',
  age_confirmed_18: true,
  onboarded_at: new Date().toISOString(),
  department: 'Computer Science & Engineering',
  course: 'B.Tech / B.E.',
  semester: 6,
  college_name: 'IIT Bombay',
  college_city: 'Mumbai',
  college_state: 'Maharashtra',
};

const sampleImageUrls = [
  'https://images.pexels.com/photos/4207808/pexels-photo-4207808.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4208080/pexels-photo-4208080.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4207717/pexels-photo-4207717.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4207725/pexels-photo-4207725.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4207735/pexels-photo-4207735.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4207755/pexels-photo-4207755.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2762810/pexels-photo-2762810.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1903702/pexels-photo-1903702.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1432673/pexels-photo-1432673.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3771110/pexels-photo-3771110.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const sellerNames = [
  { id: 's1', full_name: 'Priya Patel', hostel: 'A-Block Hostel', graduation_year: 2025, is_senior: true },
  { id: 's2', full_name: 'Rohan Verma', hostel: 'B-Block Hostel', graduation_year: 2025, is_senior: true },
  { id: 's3', full_name: 'Sneha Reddy', hostel: 'C-Block Hostel', graduation_year: 2026, is_senior: false },
  { id: 's4', full_name: 'Karthik Nair', hostel: 'D-Block Hostel', graduation_year: 2025, is_senior: true },
  { id: 's5', full_name: 'Ananya Gupta', hostel: 'A-Block Hostel', graduation_year: 2026, is_senior: false },
];

const listingData = [
  { title: 'Single Bed Mattress (6-inch foam)', cat: 'cat1', price: 800, condition: 'good' as const, negotiable: true, hostel: 'A-Block Hostel', desc: 'Used for 2 years. Good condition, no tears. Orthopedic foam. Selling because graduating.' },
  { title: 'Study Table with Drawer', cat: 'cat1', price: 1500, condition: 'like_new' as const, negotiable: false, hostel: 'B-Block Hostel', desc: 'Bought last semester, barely used. Solid wood, one drawer, perfect for hostel room.' },
  { title: 'Engineering Mathematics — B.S. Grewal', cat: 'cat2', price: 250, condition: 'good' as const, negotiable: true, hostel: 'C-Block Hostel', desc: 'Sem 1-2 math textbook. Some highlights and notes in margins but all pages intact.' },
  { title: 'Data Structures & Algorithms in C', cat: 'cat2', price: 300, condition: 'like_new' as const, negotiable: false, hostel: 'A-Block Hostel', desc: 'Clean copy, no markings. Best book for DSA prep.' },
  { title: 'Amazon Basics LED Desk Lamp', cat: 'cat3', price: 450, condition: 'like_new' as const, negotiable: false, hostel: 'D-Block Hostel', desc: 'USB-powered LED lamp with 3 brightness levels. Perfect for night study.' },
  { title: 'Boat Stone 350 Bluetooth Speaker', cat: 'cat3', price: 1200, condition: 'good' as const, negotiable: true, hostel: 'B-Block Hostel', desc: 'Great sound, 10-hour battery. Minor scratch on the side but works perfectly.' },
  { title: 'Prestige 1L Electric Kettle', cat: 'cat4', price: 350, condition: 'okay' as const, negotiable: true, hostel: 'A-Block Hostel', desc: 'Works fine, heats water in 2 mins. Some limescale inside, can be cleaned.' },
  { title: 'Bajaj DX-6 Dry Iron', cat: 'cat4', price: 300, condition: 'good' as const, negotiable: false, hostel: 'C-Block Hostel', desc: 'Lightweight dry iron. Used occasionally. No issues.' },
  { title: 'Non-stick Cookware Set (3 pcs)', cat: 'cat5', price: 600, condition: 'good' as const, negotiable: true, hostel: 'D-Block Hostel', desc: 'Tawa, kadai, and frying pan. Non-stick coating intact. Great for hostel cooking.' },
  { title: 'Plastic Storage Boxes (set of 4)', cat: 'cat5', price: 200, condition: 'like_new' as const, negotiable: false, hostel: 'B-Block Hostel', desc: 'Stackable transparent boxes with lids. Perfect for organizing hostel shelves.' },
  { title: 'Standing Whiteboard (3x2 ft)', cat: 'cat6', price: 400, condition: 'good' as const, negotiable: true, hostel: 'A-Block Hostel', desc: 'Foldable standing whiteboard with marker tray. Great for study groups.' },
  { title: 'Highlighter Set (12 colors)', cat: 'cat6', price: 80, condition: 'like_new' as const, negotiable: false, hostel: 'C-Block Hostel', desc: 'Unused highlighter set. 12 fluorescent colors.' },
  { title: 'String Lights (10m warm white)', cat: 'cat7', price: 150, condition: 'good' as const, negotiable: false, hostel: 'D-Block Hostel', desc: 'LED fairy lights for room decoration. USB powered. Creates cozy vibe.' },
  { title: 'Wall Poster Set (4 posters)', cat: 'cat7', price: 100, condition: 'okay' as const, negotiable: true, hostel: 'B-Block Hostel', desc: 'Motivational posters. Some tape marks on corners but otherwise fine.' },
  { title: 'Plastic Chair', cat: 'cat1', price: 150, condition: 'okay' as const, negotiable: true, hostel: 'A-Block Hostel', desc: 'Basic plastic chair. Sturdy but faded color.' },
  { title: 'Mechanical Engineering Drawing Kit', cat: 'cat6', price: 500, condition: 'good' as const, negotiable: false, hostel: 'C-Block Hostel', desc: 'Complete drafting kit: compass, scales, protractor, set squares. All in case.' },
  { title: 'Mi Power Bank 10000mAh', cat: 'cat3', price: 550, condition: 'like_new' as const, negotiable: false, hostel: 'D-Block Hostel', desc: 'Fast charging power bank. Barely used, still holds full charge.' },
  { title: 'Crompton Ceiling Fan', cat: 'cat4', price: 700, condition: 'good' as const, negotiable: true, hostel: 'B-Block Hostel', desc: '1200mm ceiling fan. Works well. Dismounted and ready to pick up.' },
  { title: 'Physics Lab Manual (Sem 3-4)', cat: 'cat2', price: 120, condition: 'okay' as const, negotiable: false, hostel: 'A-Block Hostel', desc: 'Lab manual with completed experiments. Useful for reference.' },
  { title: 'Wooden Bookshelf (5 shelf)', cat: 'cat1', price: 2000, condition: 'good' as const, negotiable: true, hostel: 'D-Block Hostel', desc: 'Compact 5-shelf bookshelf. Fits in hostel corner. Can hold ~50 books.' },
  { title: 'Python Programming — Let Us Python', cat: 'cat2', price: 180, condition: 'like_new' as const, negotiable: false, hostel: 'C-Block Hostel', desc: 'Latest edition. Clean, no markings. Great for beginners.' },
  { title: 'Room Cooler (Symphony)', cat: 'cat4', price: 1800, condition: 'good' as const, negotiable: true, hostel: 'A-Block Hostel', desc: 'Personal air cooler. Good for small hostel rooms. Needs new cooling pad.' },
  { title: 'Desk Organizer with Phone Stand', cat: 'cat6', price: 120, condition: 'like_new' as const, negotiable: false, hostel: 'B-Block Hostel', desc: 'Bamboo desk organizer with built-in phone stand. Keeps desk tidy.' },
  { title: 'Curtains (Blackout, 7ft pair)', cat: 'cat7', price: 350, condition: 'good' as const, negotiable: false, hostel: 'D-Block Hostel', desc: 'Blackout curtains, navy blue. Blocks light well for daytime naps.' },
];

// How old each sample item is, in months.
const sampleAges = [24, 6, 18, 8, 10, 14, 30, 12, 20, 4, 9, 2, 5, 7, 36, 15, 11, 28, 16, 3, 13, 22, 8, 19];

function generateListings(): Listing[] {
  const now = new Date();
  return listingData.map((l, i) => {
    const seller = sellerNames[i % sellerNames.length];
    const createdAt = new Date(now.getTime() - (i + 1) * 86400000 * Math.random() * 5);
    const pickupDate = new Date(now.getTime() + (Math.random() * 20 + 2) * 86400000);
    const expiresAt = new Date(createdAt.getTime() + 60 * 86400000);
    const statuses = ['available', 'available', 'available', 'available', 'reserved', 'sold'] as const;
    const status = i < 18 ? 'available' : statuses[i % statuses.length];
    const imgCount = Math.min(3, (i % 3) + 1);
    const image_urls = Array.from({ length: imgCount }, (_, j) =>
      sampleImageUrls[(i * 3 + j) % sampleImageUrls.length]
    );

    return {
      id: `listing-${i + 1}`,
      seller_id: seller.id,
      college_id: 'col1',
      category_id: l.cat,
      title: l.title,
      description: l.desc,
      price_inr: l.price,
      condition: l.condition,
      hostel: l.hostel,
      status,
      is_negotiable: l.negotiable,
      pickup_before: pickupDate.toISOString().split('T')[0],
      age_months: sampleAges[i % sampleAges.length],
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      category: mockCategories.find(c => c.id === l.cat),
      seller: {
        id: seller.id,
        full_name: seller.full_name,
        avatar_url: null,
        hostel: seller.hostel,
        is_senior: seller.is_senior,
      },
      images: image_urls.map((url, j) => ({
        id: `img-${i}-${j}`,
        listing_id: `listing-${i + 1}`,
        storage_path: url,
        sort_order: j,
      })),
      image_urls,
    };
  });
}

export const mockListings: Listing[] = generateListings();

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    listing_id: 'listing-1',
    buyer_id: 'user1',
    seller_id: 's1',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    listing: mockListings[0],
    other_user: { id: 's1', full_name: 'Priya Patel', avatar_url: null, hostel: 'A-Block Hostel', is_senior: true },
    last_message: 'Is the mattress still available?',
    unread_count: 2,
  },
  {
    id: 'conv2',
    listing_id: 'listing-5',
    buyer_id: 'user1',
    seller_id: 's4',
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    listing: mockListings[4],
    other_user: { id: 's4', full_name: 'Karthik Nair', avatar_url: null, hostel: 'D-Block Hostel', is_senior: true },
    last_message: 'Can you do ₹400 for the lamp?',
    unread_count: 0,
  },
  {
    id: 'conv3',
    listing_id: 'listing-6',
    buyer_id: 'user1',
    seller_id: 's2',
    last_message_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    listing: mockListings[5],
    other_user: { id: 's2', full_name: 'Rohan Verma', avatar_url: null, hostel: 'B-Block Hostel', is_senior: true },
    last_message: 'Sure, when can you pick it up?',
    unread_count: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
  conv1: [
    { id: 'm1', conversation_id: 'conv1', sender_id: 'user1', body: 'Hi! Is the mattress still available?', created_at: new Date(Date.now() - 7200000).toISOString(), read_at: new Date(Date.now() - 7100000).toISOString() },
    { id: 'm2', conversation_id: 'conv1', sender_id: 's1', body: 'Yes it is! Still in good condition.', created_at: new Date(Date.now() - 7000000).toISOString(), read_at: new Date(Date.now() - 6900000).toISOString() },
    { id: 'm3', conversation_id: 'conv1', sender_id: 'user1', body: 'Great. What is your best price?', created_at: new Date(Date.now() - 3700000).toISOString(), read_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm4', conversation_id: 'conv1', sender_id: 's1', body: 'I can do ₹700 if you pick it up by Friday.', created_at: new Date(Date.now() - 3600000).toISOString(), read_at: null },
    { id: 'm5', conversation_id: 'conv1', sender_id: 's1', body: 'Is the mattress still available?', created_at: new Date(Date.now() - 3500000).toISOString(), read_at: null },
  ],
  conv2: [
    { id: 'm6', conversation_id: 'conv2', sender_id: 'user1', body: 'Interested in the desk lamp. Can you do ₹400?', created_at: new Date(Date.now() - 86400000).toISOString(), read_at: new Date(Date.now() - 86300000).toISOString() },
  ],
  conv3: [
    { id: 'm7', conversation_id: 'conv3', sender_id: 'user1', body: 'Is the speaker still available?', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), read_at: new Date(Date.now() - 2 * 86400000 + 60000).toISOString() },
    { id: 'm8', conversation_id: 'conv3', sender_id: 's2', body: 'Sure, when can you pick it up?', created_at: new Date(Date.now() - 2 * 86400000 + 120000).toISOString(), read_at: new Date(Date.now() - 2 * 86400000 + 130000).toISOString() },
  ],
};
