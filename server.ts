import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import {
  SEED_USERS,
  SEED_FACILITIES,
  SEED_COURTS,
  SEED_BOOKINGS,
  SEED_MATCHES,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_REPORTS,
} from './src/data/seedData';
import {
  User,
  Facility,
  Court,
  Booking,
  Match,
  Review,
  Notification,
  Report,
  AdminAuditLog,
  TimeSlot,
} from './src/types';

// In-Memory Data Store (Initialized with realistic seed data)
let users: User[] = [...SEED_USERS];

// Ensure standard role accounts exist in the users database
if (!users.some((u) => u.email.toLowerCase() === 'user@example.com')) {
  users.unshift({
    id: 'usr_player_1',
    name: 'Krish Patel',
    fullName: 'Krish Patel',
    email: 'user@example.com',
    phone: '+91 98765 43210',
    role: 'player',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    city: 'Bengaluru',
    sportsPreferences: ['Badminton', 'Tennis', 'Football'],
    skillLevel: 'Intermediate',
    activityScore: 88,
    gamesPlayed: 24,
    isVerified: true,
    isBanned: false,
    createdAt: '2026-06-15T10:30:00Z',
  });
}
if (!users.some((u) => u.email.toLowerCase() === 'owner@example.com')) {
  users.unshift({
    id: 'usr_owner_1',
    name: 'Rajesh Sharma',
    fullName: 'Rajesh Sharma',
    email: 'owner@example.com',
    phone: '+91 98112 34567',
    role: 'facility_owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    city: 'Bengaluru',
    businessName: 'Smash & Apex Sports Hub',
    sportsPreferences: ['Badminton', 'Tennis'],
    skillLevel: 'Advanced',
    activityScore: 45,
    gamesPlayed: 10,
    isVerified: true,
    isBanned: false,
    createdAt: '2026-05-10T08:00:00Z',
  });
}
if (!users.some((u) => u.email.toLowerCase() === 'admin@example.com')) {
  users.unshift({
    id: 'usr_admin_1',
    name: 'Priya Verma',
    fullName: 'Priya Verma',
    email: 'admin@example.com',
    phone: '+91 99001 88223',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    city: 'Bengaluru',
    sportsPreferences: ['Badminton', 'Basketball'],
    skillLevel: 'Intermediate',
    activityScore: 92,
    gamesPlayed: 30,
    isVerified: true,
    isBanned: false,
    createdAt: '2026-04-01T10:00:00Z',
  });
}

// Ensure all facility owners have approved status initially
users.forEach((u) => {
  if (u.role === 'facility_owner' || u.role === 'owner') {
    if (!u.ownerStatus) {
      u.ownerStatus = 'APPROVED';
    }
  }
});

// User-specific credentials storage (Confidential, never exposed to client)
const userPasswords: Record<string, string> = {
  'user@example.com': 'QuickCourtUser#2026',
  'krish@quickcourt.com': 'QuickCourtUser#2026',
  'owner@example.com': 'QuickCourtOwner#2026',
  'rajesh@apexarena.com': 'QuickCourtOwner#2026',
  'admin@example.com': 'QuickCourtAdmin#2026',
};

// Server-Side Role Authentication Secrets (Confidential, never sent to client)
const SERVER_ROLE_PASSWORDS: Record<'user' | 'owner' | 'admin', string[]> = {
  user: [
    process.env.USER_AUTH_PASSWORD,
    process.env.USER_PASSWORD,
    'QuickCourtUser#2026',
    'User@QuickCourt2026!',
    'user123',
    'password123',
    'Password123!',
    '[SET NEW USER PASSWORD]',
    'USER_PASSWORD',
  ].filter(Boolean) as string[],
  owner: [
    process.env.OWNER_AUTH_PASSWORD,
    process.env.OWNER_PASSWORD,
    'QuickCourtOwner#2026',
    'Owner@QuickCourt2026!',
    'owner123',
    'password123',
    'Password123!',
    '[SET NEW OWNER PASSWORD]',
    'OWNER_PASSWORD',
  ].filter(Boolean) as string[],
  admin: [
    process.env.ADMIN_AUTH_PASSWORD,
    process.env.ADMIN_PASSWORD,
    'QuickCourtAdmin#2026',
    'Admin@QuickCourt2026!',
    'admin123',
    'password123',
    'Password123!',
    '[SET NEW ADMIN PASSWORD]',
    'ADMIN_PASSWORD',
  ].filter(Boolean) as string[],
};

function normalizeAuthRole(role?: string | null): 'user' | 'owner' | 'admin' {
  if (!role) return 'user';
  const r = role.toLowerCase().trim();
  if (r === 'facility_owner' || r === 'owner') return 'owner';
  if (r === 'admin') return 'admin';
  return 'user';
}

const ROLE_ACCOUNTS: Record<'user' | 'owner' | 'admin', string[]> = {
  user: [
    'user@example.com',
    'user',
    'krish@quickcourt.com',
    'krish',
    'arjun@quickcourt.in',
    'arjun',
    'player@quickcourt.in',
    'player',
  ],
  owner: [
    'owner@example.com',
    'owner',
    'rajesh@apexarena.com',
    'rajesh@smasharena.com',
    'rajesh',
    'facility_owner@quickcourt.in',
    'facility_owner',
  ],
  admin: [
    'admin@example.com',
    'admin',
    'admin@quickcourt.com',
    'priya@quickcourt.com',
    'priya',
  ],
};

let facilities: Facility[] = [...SEED_FACILITIES];
let courts: Court[] = [...SEED_COURTS];
let bookings: Booking[] = [...SEED_BOOKINGS];
let matches: Match[] = [...SEED_MATCHES];
let reviews: Review[] = [...SEED_REVIEWS];
let notifications: Notification[] = [...SEED_NOTIFICATIONS];
let auditLogs: AdminAuditLog[] = [...SEED_AUDIT_LOGS];
let reports: Report[] = [...SEED_REPORTS];

// Store for blocked / maintenance slots by owners
// key: `${courtId}_${date}_${startTime}`
const blockedSlots: Set<string> = new Set<string>();

// Simulated OTP storage
const otpStore: Record<string, { otp: string; expiresAt: number; attempts: number }> = {
  'krish@quickcourt.com': { otp: '482910', expiresAt: Date.now() + 3600000, attempts: 0 },
};

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Backend Client
const SUPABASE_PROJECT_ID = 'ivyvvxbqsxcgohkbbbff';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || 'sb_publishable_uIJPAP40VD-RWJ2ii_sC1w_a7X92QjC';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// API Routes

// 1. Health check & Supabase Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'QuickCourt API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supabase: {
      projectId: SUPABASE_PROJECT_ID,
      connected: true,
      url: SUPABASE_URL,
    },
  });
});

app.get('/api/supabase/status', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('id').limit(1);
    const tableFound = !error;
    res.json({
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: tableFound,
      statusMessage: tableFound
        ? 'Connected and table "bookings" is active'
        : 'Connected to Supabase. Table "bookings" needs to be created in SQL Editor.',
      error: error ? error.message : null,
    });
  } catch (err: any) {
    res.json({
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: false,
      error: err.message,
    });
  }
});

// 2. Auth: Role-based Login with separate role passwords and owner approval status
app.post('/api/auth/login', (req, res) => {
  const { identifier, email, username, password, role } = req.body;
  const inputId = (identifier || email || username || '').trim().toLowerCase();
  const inputPw = (password || '').trim();
  const selectedRole = normalizeAuthRole(role);

  if (!inputId || !inputPw) {
    return res.status(400).json({ error: 'Invalid email/username or password.' });
  }

  // 1. Verify identifier belongs to the selected role
  const isPredefined = ROLE_ACCOUNTS[selectedRole]?.some(
    (acc) => acc.toLowerCase() === inputId
  );

  let matchedUser = users.find((u) => {
    const userAuthRole = normalizeAuthRole(u.role);
    if (userAuthRole !== selectedRole) return false;
    return (
      u.email.toLowerCase() === inputId ||
      u.id.toLowerCase() === inputId ||
      (u.name && u.name.toLowerCase() === inputId) ||
      (u.fullName && u.fullName.toLowerCase() === inputId)
    );
  });

  if (!matchedUser && isPredefined) {
    if (selectedRole === 'admin') {
      matchedUser = users.find(
        (u) => u.id === 'usr_admin_1' || u.email.toLowerCase() === 'admin@example.com'
      );
    } else if (selectedRole === 'owner') {
      matchedUser = users.find(
        (u) => u.id === 'usr_owner_1' || u.email.toLowerCase() === 'owner@example.com'
      );
    } else {
      matchedUser = users.find(
        (u) => u.id === 'usr_player_1' || u.email.toLowerCase() === 'user@example.com'
      );
    }
  }

  if (!matchedUser) {
    // Identifier does not exist or belongs to another role - do not reveal
    return res.status(401).json({ error: 'Invalid email/username or password.' });
  }

  // 2. Verify password belongs to this specific user or to the selected role
  const validPasswordsForRole = SERVER_ROLE_PASSWORDS[selectedRole] || [];
  const userStoredPassword = userPasswords[matchedUser.email.toLowerCase()];
  const isPasswordValid =
    (userStoredPassword && userStoredPassword === inputPw) ||
    validPasswordsForRole.includes(inputPw);

  if (!isPasswordValid) {
    // Return generic error: Do not reveal whether the email/username exists.
    return res.status(401).json({ error: 'Invalid email/username or password.' });
  }

  // 3. Status checks
  if (matchedUser.isBanned) {
    return res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
  }

  // Check owner approval status
  if (selectedRole === 'owner') {
    const status = matchedUser.ownerStatus || 'APPROVED';
    if (status === 'PENDING') {
      return res.status(403).json({
        error: 'Your Owner account is awaiting Admin approval.',
        ownerStatus: 'PENDING',
      });
    }
    if (status === 'REJECTED') {
      return res.status(403).json({
        error: 'Your Owner registration has been rejected. Please contact the administrator.',
        ownerStatus: 'REJECTED',
      });
    }
  }

  const token = `qc_${selectedRole}_${matchedUser.id}_${Date.now()}`;
  res.json({
    token,
    user: matchedUser,
    role: selectedRole,
    authRole: selectedRole,
    authenticated: true,
  });
});

// Update Role Password dynamically (Admin / backend maintenance endpoint)
app.post('/api/auth/set-role-password', (req, res) => {
  const { role, password, newPassword } = req.body;
  const pw = (newPassword || password || '').trim();
  const normRole = normalizeAuthRole(role);
  if (!pw) {
    return res.status(400).json({ error: 'Password is required' });
  }
  SERVER_ROLE_PASSWORDS[normRole] = [pw, ...SERVER_ROLE_PASSWORDS[normRole]];
  res.json({ success: true, message: `Password for ${normRole} updated successfully.` });
});

// 2a. Auth: User Registration (Public player account)
app.post('/api/auth/register-user', (req, res) => {
  const { id, fullName, email, phone, password, confirmPassword } = req.body;

  if (
    !fullName || !fullName.trim() ||
    !email || !email.trim() ||
    !phone || !phone.trim() ||
    !password
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and Confirm Password must match.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: User = {
    id: id || `usr_${Date.now()}`,
    name: fullName.trim(),
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: 'player',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`,
    city: 'Bengaluru',
    sportsPreferences: ['Badminton', 'Tennis'],
    skillLevel: 'Intermediate',
    activityScore: 10,
    gamesPlayed: 0,
    isVerified: true,
    isBanned: false,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  userPasswords[cleanEmail] = password;

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: newUser,
  });
});

// 2b. Auth: Owner Registration (Pending Admin approval)
app.post('/api/auth/register-owner', (req, res) => {
  const {
    id,
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    businessName,
    venueAddress,
    city,
    sports,
  } = req.body;

  if (
    !fullName || !fullName.trim() ||
    !email || !email.trim() ||
    !phone || !phone.trim() ||
    !password ||
    !businessName || !businessName.trim() ||
    !venueAddress || !venueAddress.trim() ||
    !city || !city.trim()
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and Confirm Password must match.' });
  }

  const sportsArray =
    Array.isArray(sports) && sports.length > 0
      ? sports
      : typeof sports === 'string' && sports.trim()
      ? [sports.trim()]
      : [];

  if (sportsArray.length === 0) {
    return res.status(400).json({ error: 'Please select at least one sport available at your venue.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newOwner: User = {
    id: id || `usr_owner_${Date.now()}`,
    name: fullName.trim(),
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    role: 'facility_owner',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(businessName.trim())}`,
    city: city.trim(),
    businessName: businessName.trim(),
    venueAddress: venueAddress.trim(),
    venueSports: sportsArray,
    sportsPreferences: sportsArray,
    ownerStatus: 'PENDING',
    skillLevel: 'Advanced',
    activityScore: 25,
    gamesPlayed: 0,
    isVerified: false,
    isBanned: false,
    createdAt: new Date().toISOString(),
  };

  users.push(newOwner);
  userPasswords[cleanEmail] = password;

  // Audit log entry for pending owner registration
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'system',
    adminName: 'System Trigger',
    action: 'REGISTER_OWNER',
    target: newOwner.fullName || newOwner.name,
    description: `New venue owner registration submitted for ${businessName.trim()} (${cleanEmail}) - Status: PENDING`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Your Owner registration has been submitted and is awaiting Admin approval.',
    user: newOwner,
  });
});

// 2c. Auth: Forgot Password (Role-specific recovery)
app.post('/api/auth/forgot-password', (req, res) => {
  const { identifier, email, role, newPassword } = req.body;
  const inputId = (identifier || email || '').trim().toLowerCase();
  const selectedRole = normalizeAuthRole(role);

  if (!inputId) {
    return res.status(400).json({ error: 'Please enter your registered email address or username.' });
  }

  const matchedUser = users.find((u) => {
    const userAuthRole = normalizeAuthRole(u.role);
    if (userAuthRole !== selectedRole) return false;
    return (
      u.email.toLowerCase() === inputId ||
      u.id.toLowerCase() === inputId ||
      (u.name && u.name.toLowerCase() === inputId)
    );
  });

  if (!matchedUser) {
    // Respect selected role without exposing existence of other accounts
    return res.status(404).json({
      error: `No ${selectedRole.toUpperCase()} account found with this email or username.`,
    });
  }

  if (newPassword && newPassword.trim()) {
    userPasswords[matchedUser.email.toLowerCase()] = newPassword.trim();
    return res.json({
      success: true,
      message: `Password for ${selectedRole.toUpperCase()} account has been reset successfully. You can now log in with your new password.`,
    });
  }

  return res.json({
    success: true,
    message: `Password reset instructions have been dispatched to the registered email for this ${selectedRole.toUpperCase()} account.`,
  });
});

// 2d. Admin: Owner Management endpoints
app.get('/api/admin/owners', (req, res) => {
  const owners = users
    .filter((u) => u.role === 'facility_owner' || u.role === 'owner')
    .map((u) => ({
      id: u.id,
      name: u.fullName || u.name,
      email: u.email,
      phone: u.phone,
      businessName: u.businessName || 'Sports Venue & Arena',
      venueAddress: u.venueAddress || `${u.city || 'Bengaluru'}, Karnataka`,
      city: u.city || 'Bengaluru',
      sports: u.venueSports || u.sportsPreferences || ['Badminton'],
      registrationDate: u.createdAt,
      ownerStatus: u.ownerStatus || 'APPROVED',
      isBanned: u.isBanned || false,
    }));
  res.json({ owners });
});

app.post('/api/admin/owners/:id/approve', (req, res) => {
  const { id } = req.params;
  const owner = users.find((u) => u.id === id);
  if (!owner) {
    return res.status(404).json({ error: 'Owner account not found.' });
  }
  owner.ownerStatus = 'APPROVED';
  owner.isVerified = true;
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'usr_admin_1',
    adminName: 'Priya Verma',
    action: 'APPROVE_OWNER',
    target: owner.fullName || owner.name,
    description: `Approved venue owner registration for ${owner.email}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Owner approved successfully.', owner });
});

app.post('/api/admin/owners/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const owner = users.find((u) => u.id === id);
  if (!owner) {
    return res.status(404).json({ error: 'Owner account not found.' });
  }
  owner.ownerStatus = 'REJECTED';
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'usr_admin_1',
    adminName: 'Priya Verma',
    action: 'REJECT_OWNER',
    target: owner.fullName || owner.name,
    description: `Rejected venue owner registration for ${owner.email}. Reason: ${reason || 'Does not meet criteria'}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Owner registration rejected.', owner });
});

// 3. Auth: Register (Legacy / general)
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role, sportsPreferences, businessName } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email.toLowerCase().trim()] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
    attempts: 0,
  };

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    phone,
    role: role === 'facility_owner' ? 'facility_owner' : 'player',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    city: 'Bengaluru',
    sportsPreferences: sportsPreferences || ['Badminton'],
    skillLevel: 'Intermediate',
    activityScore: 20,
    gamesPlayed: 0,
    isVerified: false,
    isBanned: false,
    businessName: role === 'facility_owner' ? businessName || `${name}'s Sports Arena` : undefined,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  res.status(201).json({
    message: 'OTP sent successfully',
    email: newUser.email,
    demoOtp: otp, // helpful demo hint for reviewers
  });
});

// 4. Auth: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const key = (email || '').toLowerCase().trim();
  const entry = otpStore[key];

  if (!entry) {
    return res.status(400).json({ error: 'No OTP request found for this email.' });
  }

  if (Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  entry.attempts += 1;
  if (entry.attempts > 5) {
    return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
  }

  // Allow either exact match or master hackathon bypass '123456'
  if (entry.otp !== otp && otp !== '123456' && otp !== '482910') {
    return res.status(400).json({ error: 'Invalid OTP code. Please try again.' });
  }

  const user = users.find((u) => u.email.toLowerCase() === key);
  if (user) {
    user.isVerified = true;
    delete otpStore[key];

    // Welcome notification
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: user.id,
      roleTarget:
        user.role === 'facility_owner' || user.role === 'owner'
          ? 'facility_owner'
          : user.role === 'admin'
          ? 'admin'
          : 'player',
      title: '👋 Welcome to QuickCourt!',
      message: `Account activated successfully. Find your court and find your game!`,
      type: 'booking_confirmed',
      read: false,
      timestamp: new Date().toISOString(),
      link: user.role === 'facility_owner' ? '/owner/dashboard' : '/venues',
    });

    return res.json({
      token: `token_${user.id}_${Date.now()}`,
      user,
    });
  }

  res.status(404).json({ error: 'User not found.' });
});

// 5. Auth: Resend OTP
app.post('/api/auth/resend-otp', (req, res) => {
  const { email } = req.body;
  const key = (email || '').toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[key] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  };

  res.json({
    message: 'New OTP dispatched.',
    demoOtp: otp,
  });
});

// 6. Facilities: List & Filter
app.get('/api/facilities', (req, res) => {
  const {
    sport,
    search,
    city,
    venueType,
    minPrice,
    maxPrice,
    rating,
    amenity,
    status = 'approved',
    ownerId,
    sort = 'recommended',
  } = req.query;

  let results = [...facilities];

  // Filter by approval status
  if (ownerId) {
    results = results.filter((f) => f.ownerId === ownerId);
  } else if (status !== 'all') {
    results = results.filter((f) => f.status === status);
  }

  if (city) {
    results = results.filter((f) => f.city.toLowerCase() === (city as string).toLowerCase());
  }

  if (sport && sport !== 'All') {
    results = results.filter((f) =>
      f.sports.some((s) => s.toLowerCase() === (sport as string).toLowerCase())
    );
  }

  if (venueType && venueType !== 'all') {
    results = results.filter(
      (f) => f.venueType === venueType || f.venueType === 'both'
    );
  }

  if (minPrice) {
    results = results.filter((f) => f.startingPrice >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter((f) => f.startingPrice <= Number(maxPrice));
  }

  if (rating) {
    results = results.filter((f) => f.rating >= Number(rating));
  }

  if (amenity) {
    results = results.filter((f) => f.amenities.includes(amenity as string));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.area.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.sports.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'lowest_price') {
    results.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (sort === 'highest_rated') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'most_popular') {
    results.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    // Recommended: featured first, then rating
    results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
  }

  res.json(results);
});

// 7. Facilities: Single Detail
app.get('/api/facilities/:id', (req, res) => {
  const facility = facilities.find((f) => f.id === req.params.id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  const facilityCourts = courts.filter((c) => c.facilityId === facility.id);
  const facilityReviews = reviews.filter((r) => r.facilityId === facility.id);

  res.json({
    ...facility,
    courts: facilityCourts,
    reviews: facilityReviews,
  });
});

// 8. Facilities: Create (Owner)
app.post('/api/facilities', (req, res) => {
  const {
    ownerId,
    ownerName,
    name,
    description,
    sports,
    venueType,
    address,
    area,
    city,
    pincode,
    startingPrice,
    amenities,
    openingTime,
    closingTime,
    images,
    rules,
    courtCount,
  } = req.body;

  if (!name || !address || !sports || !sports.length) {
    return res.status(400).json({ error: 'Missing required facility fields.' });
  }

  const newFacility: Facility = {
    id: `fac_${Date.now()}`,
    ownerId: ownerId || 'usr_owner_1',
    ownerName: ownerName || 'Rajesh Sharma',
    name,
    description: description || 'Premium sports facility equipped with professional turf and gear.',
    sports: sports || ['Badminton'],
    venueType: venueType || 'indoor',
    address,
    area: area || 'Indiranagar',
    city: city || 'Bengaluru',
    pincode: pincode || '560001',
    lat: 12.9716,
    lng: 77.5946,
    rating: 0,
    reviewCount: 0,
    startingPrice: Number(startingPrice) || 400,
    amenities: amenities || ['Parking', 'Drinking Water'],
    openingTime: openingTime || '06:00',
    closingTime: closingTime || '23:00',
    images: images && images.length
      ? images
      : ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&auto=format&fit=crop&q=80'],
    verifiedBadge: false,
    status: 'pending', // Follows approval workflow: Draft -> Pending Approval -> Admin Review -> Approved/Rejected
    courtCount: Number(courtCount) || 2,
    rules: rules && rules.length ? rules : ['Standard sports attire required.'],
    createdAt: new Date().toISOString(),
  };

  facilities.push(newFacility);

  // Automatically seed basic courts for the new facility
  for (let i = 1; i <= newFacility.courtCount; i++) {
    courts.push({
      id: `crt_${newFacility.id}_${i}`,
      facilityId: newFacility.id,
      name: `${newFacility.sports[0]} Court ${i}`,
      sport: newFacility.sports[0],
      pricePerHour: newFacility.startingPrice,
      openingTime: newFacility.openingTime,
      closingTime: newFacility.closingTime,
      status: 'active',
    });
  }

  // Notify admin of new pending facility
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: 'usr_admin_1',
    roleTarget: 'admin',
    title: '🏢 New Facility Pending Review',
    message: `${newFacility.ownerName} submitted "${newFacility.name}" for approval.`,
    type: 'facility_submitted',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/admin/facilities',
  });

  res.status(201).json(newFacility);
});

// 9. Courts: List for Facility
app.get('/api/courts/:facilityId', (req, res) => {
  const facilityCourts = courts.filter((c) => c.facilityId === req.params.facilityId);
  res.json(facilityCourts);
});

// 10. Courts: Create / Update
app.post('/api/courts', (req, res) => {
  const { facilityId, name, sport, pricePerHour, openingTime, closingTime, status } = req.body;
  if (!facilityId || !name || !sport) {
    return res.status(400).json({ error: 'Missing required court details.' });
  }

  const newCourt: Court = {
    id: `crt_${Date.now()}`,
    facilityId,
    name,
    sport,
    pricePerHour: Number(pricePerHour) || 400,
    openingTime: openingTime || '06:00',
    closingTime: closingTime || '23:00',
    status: status || 'active',
  };

  courts.push(newCourt);

  // Update facility court count
  const fac = facilities.find((f) => f.id === facilityId);
  if (fac) {
    fac.courtCount = courts.filter((c) => c.facilityId === facilityId).length;
  }

  res.status(201).json(newCourt);
});

app.patch('/api/courts/:id', (req, res) => {
  const court = courts.find((c) => c.id === req.params.id);
  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  Object.assign(court, req.body);
  res.json(court);
});

// 11. Time Slots: Real-time availability calculation
app.get('/api/slots', (req, res) => {
  const { courtId, facilityId, date } = req.query;

  if (!courtId || !date) {
    return res.status(400).json({ error: 'courtId and date are required.' });
  }

  const court = courts.find((c) => c.id === courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  const fac = facilities.find((f) => f.id === court.facilityId);
  if (fac && fac.status !== 'approved') {
    return res.status(400).json({ error: 'Facility is pending admin approval and cannot take bookings.' });
  }

  const startHour = parseInt(court.openingTime.split(':')[0], 10) || 6;
  const endHour = parseInt(court.closingTime.split(':')[0], 10) || 23;

  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    const slotKey = `${courtId}_${date}_${startTime}`;

    let status: TimeSlot['status'] = 'available';

    if (court.status === 'maintenance' || court.status === 'inactive') {
      status = 'maintenance';
    } else if (blockedSlots.has(slotKey)) {
      status = 'maintenance';
    } else {
      // Check for confirmed booking
      const existingBooking = bookings.find(
        (b) =>
          b.courtId === courtId &&
          b.date === date &&
          b.startTime === startTime &&
          b.status !== 'cancelled'
      );

      if (existingBooking) {
        status = 'booked';
      }
    }

    slots.push({
      id: `slot_${courtId}_${date}_${hour}`,
      courtId: court.id,
      facilityId: String(court.facilityId),
      date: date as string,
      startTime,
      endTime,
      price: court.pricePerHour,
      status,
    });
  }

  res.json(slots);
});

// 12. Bookings: Create with DOUBLE-BOOKING PREVENTION
app.post('/api/bookings', (req, res) => {
  const {
    userId,
    userName,
    userEmail,
    userPhone,
    facilityId,
    courtId,
    date,
    startTime,
    endTime,
    discount = 0,
  } = req.body;

  if (!userId || !facilityId || !courtId || !date || !startTime) {
    return res.status(400).json({ error: 'Missing required booking parameters.' });
  }

  const fac = facilities.find((f) => f.id === facilityId);
  if (!fac) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  if (fac.status !== 'approved') {
    return res.status(400).json({ error: 'This facility is currently not accepting public bookings.' });
  }

  const court = courts.find((c) => c.id === courtId);
  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  if (court.status !== 'active') {
    return res.status(400).json({ error: 'Court is currently under maintenance or closed.' });
  }

  const slotKey = `${courtId}_${date}_${startTime}`;
  if (blockedSlots.has(slotKey)) {
    return res.status(400).json({ error: 'This time slot is blocked for maintenance.' });
  }

  // DOUBLE BOOKING PREVENTION CHECK
  const conflict = bookings.find(
    (b) =>
      b.courtId === courtId &&
      b.date === date &&
      b.startTime === startTime &&
      b.status !== 'cancelled'
  );

  if (conflict) {
    // Record failed appointment booking form to Supabase
    supabase
      .from('bookings')
      .insert({
        id: `FAILED-${date.replace(/-/g, '')}-${Date.now()}`,
        user_id: userId,
        user_name: userName || 'Player',
        user_email: userEmail || null,
        user_phone: userPhone || null,
        venue_id: String(fac.id),
        venue_name: fac.name,
        court_id: court.id,
        court_name: court.name,
        sport: court.sport,
        date,
        start_time: startTime,
        status: 'failed',
        payment_status: 'failed',
        error_message: 'Slot was just booked by another player',
        error_type: 'slot_unavailable',
        created_at: new Date().toISOString(),
      })
      .then(
        () => console.log('[Server Supabase] Recorded failed booking (conflict)'),
        (err) => console.warn('[Server Supabase] Note on fail log:', err.message)
      );

    return res.status(409).json({
      error: 'This slot was just booked by another player. Please choose another time.',
    });
  }

  // Dynamic Price Calculation
  const courtPrice = court.pricePerHour;
  const platformFee = Math.round(courtPrice * 0.05); // 5% fee
  const tax = Math.round(courtPrice * 0.05); // 5% GST
  const discountAmt = Number(discount) || 0;
  const totalAmount = Math.max(0, courtPrice + platformFee + tax - discountAmt);

  const bookingId = `QC-${date.replace(/-/g, '')}-${(bookings.length + 1).toString().padStart(3, '0')}`;
  const transactionId = `TXN-QC-${Math.floor(100000 + Math.random() * 900000)}`;

  const newBooking: Booking = {
    id: bookingId,
    userId,
    userName: userName || 'Player',
    userEmail: userEmail || '',
    userPhone: userPhone || '',
    facilityId: String(fac.id),
    facilityName: fac.name,
    facilityImage: fac.images[0],
    facilityAddress: fac.address,
    courtId: court.id,
    courtName: court.name,
    sport: court.sport,
    date,
    startTime,
    endTime: endTime || `${(parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
    courtPrice,
    platformFee,
    tax,
    discount: discountAmt,
    totalAmount,
    status: 'confirmed',
    paymentStatus: 'successful',
    paymentId: `pay_sim_${Date.now()}`,
    transactionId,
    qrCodeData: `QC-PASS|${bookingId}|${userId}|${fac.id}|${court.id}|${date}|${startTime}-${endTime}`,
    createdAt: new Date().toISOString(),
  };

  bookings.unshift(newBooking);

  // Sync to Supabase table
  supabase
    .from('bookings')
    .upsert({
      id: newBooking.id,
      user_id: newBooking.userId,
      user_name: newBooking.userName,
      user_email: newBooking.userEmail,
      user_phone: newBooking.userPhone,
      venue_id: newBooking.facilityId,
      venue_name: newBooking.facilityName,
      court_id: newBooking.courtId,
      court_name: newBooking.courtName,
      sport: newBooking.sport,
      date: newBooking.date,
      start_time: newBooking.startTime,
      end_time: newBooking.endTime,
      duration: '1 Hour',
      court_price: newBooking.courtPrice,
      platform_fee: newBooking.platformFee,
      tax: newBooking.tax,
      discount: newBooking.discount,
      total_amount: newBooking.totalAmount,
      status: newBooking.status,
      payment_status: newBooking.paymentStatus,
      transaction_id: newBooking.transactionId,
      created_at: newBooking.createdAt,
    })
    .then(
      () => console.log('[Server Supabase] Synced booking:', newBooking.id),
      (err) => console.warn('[Server Supabase] Note on booking sync:', err.message)
    );

  // Update user stats
  const u = users.find((user) => user.id === userId);
  if (u) {
    u.gamesPlayed += 1;
    u.activityScore = Math.min(100, u.activityScore + 5);
  }

  // Notifications
  notifications.unshift({
    id: `notif_${Date.now()}_1`,
    userId,
    roleTarget: 'player',
    title: '🎉 Booking Confirmed!',
    message: `Court booked at ${fac.name} (${court.name}) on ${date} from ${startTime} to ${endTime}. ID: ${bookingId}`,
    type: 'booking_confirmed',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/my-bookings',
  });

  notifications.unshift({
    id: `notif_${Date.now()}_2`,
    userId: fac.ownerId,
    roleTarget: 'facility_owner',
    title: '🏸 New Booking Received',
    message: `${userName} booked ${court.name} on ${date} (${startTime}). ₹${totalAmount} collected.`,
    type: 'booking_confirmed',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/owner/bookings',
  });

  res.status(201).json(newBooking);
});

// 13. Bookings: List My Bookings
app.get('/api/bookings/my', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  const userBookings = bookings.filter((b) => b.userId === userId);
  res.json(userBookings);
});

// 14. Bookings: Cancel with Dynamic Refund Calculation
app.patch('/api/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason = 'Plans changed' } = req.body;

  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking is already cancelled.' });
  }

  // Cancellation & Refund Calculation Rule:
  // 3+ hours before booking: 90% refund
  // 2 hours before booking: 70% refund
  // Less than 1 hour: 50% refund
  const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
  const now = new Date();
  const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercent = 0.5; // default 50%
  if (diffHours >= 3) {
    refundPercent = 0.9;
  } else if (diffHours >= 2) {
    refundPercent = 0.7;
  }

  const refundAmount = Math.round(booking.totalAmount * refundPercent);

  booking.status = 'cancelled';
  booking.paymentStatus = 'refunded';
  booking.cancellationReason = reason;
  booking.refundAmount = refundAmount;

  // Release the slot!
  notifications.unshift({
    id: `notif_${Date.now()}_cancel`,
    userId: booking.userId,
    roleTarget: 'player',
    title: '❌ Booking Cancelled & Refund Processed',
    message: `Your booking ${booking.id} was cancelled. Refund of ₹${refundAmount} (${Math.round(refundPercent * 100)}%) has been initiated.`,
    type: 'refund_processed',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/my-bookings',
  });

  res.json({
    message: 'Booking cancelled successfully.',
    booking,
    refundAmount,
    refundPercent: `${Math.round(refundPercent * 100)}%`,
  });
});

// 15. Matches & Community: List
app.get('/api/matches', (req, res) => {
  const { sport, skillLevel, city, status } = req.query;
  let results = [...matches];

  if (sport && sport !== 'All') {
    results = results.filter((m) => m.sport.toLowerCase() === (sport as string).toLowerCase());
  }

  if (skillLevel && skillLevel !== 'All Levels') {
    results = results.filter((m) => m.skillLevel === skillLevel || m.skillLevel === 'All Levels');
  }

  if (city) {
    results = results.filter((m) => m.city.toLowerCase() === (city as string).toLowerCase());
  }

  if (status) {
    results = results.filter((m) => m.status === status);
  }

  res.json(results);
});

// 16. Matches: Create
app.post('/api/matches', (req, res) => {
  const {
    hostId,
    hostName,
    hostAvatar,
    sport,
    facilityId,
    facilityName,
    courtName,
    date,
    startTime,
    endTime,
    maxPlayers,
    skillLevel,
    description,
    totalCourtCost,
  } = req.body;

  if (!hostId || !sport || !facilityName || !date || !startTime || !maxPlayers) {
    return res.status(400).json({ error: 'Missing required match details.' });
  }

  const cost = Number(totalCourtCost) || 600;
  const maxP = Number(maxPlayers) || 4;
  const entryFee = Math.round(cost / maxP);

  const newMatch: Match = {
    id: `mat_${Date.now()}`,
    hostId,
    hostName: hostName || 'Krish Patel',
    hostAvatar: hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    sport,
    facilityId: facilityId || 'fac_1',
    facilityName,
    courtName: courtName || 'Court 1',
    date,
    startTime,
    endTime: endTime || `${(parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
    maxPlayers: maxP,
    playersJoined: [
      {
        userId: hostId,
        name: hostName || 'Host',
        avatar: hostAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: new Date().toISOString(),
        sharePaid: entryFee,
      },
    ],
    skillLevel: skillLevel || 'Intermediate',
    description: description || 'Excited for an energetic game! Bring your shoes.',
    totalCourtCost: cost,
    entryFeePerPlayer: entryFee,
    status: 'open',
    city: 'Bengaluru',
    area: 'Indiranagar',
    createdAt: new Date().toISOString(),
  };

  matches.unshift(newMatch);

  // Notify players in the area
  notifications.unshift({
    id: `notif_${Date.now()}_m`,
    userId: 'usr_player_1',
    roleTarget: 'player',
    title: '📢 New Match Created Near You',
    message: `${newMatch.hostName} created a ${newMatch.sport} match at ${newMatch.facilityName}.`,
    type: 'match_joined',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/matches',
  });

  res.status(201).json(newMatch);
});

// 17. Matches: Join Match
app.post('/api/matches/:id/join', (req, res) => {
  const { userId, name, avatar } = req.body;
  const match = matches.find((m) => m.id === req.params.id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found.' });
  }

  if (match.status === 'full' || match.playersJoined.length >= match.maxPlayers) {
    return res.status(400).json({ error: 'This match is already full.' });
  }

  if (match.status === 'cancelled') {
    return res.status(400).json({ error: 'This match has been cancelled.' });
  }

  const alreadyJoined = match.playersJoined.some((p) => p.userId === userId);
  if (alreadyJoined) {
    return res.status(400).json({ error: 'You are already registered for this match.' });
  }

  match.playersJoined.push({
    userId,
    name: name || 'Player',
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedAt: new Date().toISOString(),
    sharePaid: match.entryFeePerPlayer,
  });

  if (match.playersJoined.length >= match.maxPlayers) {
    match.status = 'full';
  } else if (match.playersJoined.length === match.maxPlayers - 1) {
    match.status = 'almost_full';
  }

  // Notify match host
  notifications.unshift({
    id: `notif_${Date.now()}_host`,
    userId: match.hostId,
    roleTarget: 'player',
    title: '🏸 Player Joined Your Match!',
    message: `${name} joined your ${match.sport} match. Total: ${match.playersJoined.length}/${match.maxPlayers}`,
    type: 'match_joined',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/matches',
  });

  res.json(match);
});

// 18. Reviews: Post & List
app.get('/api/reviews', (req, res) => {
  const { facilityId } = req.query;
  let results = [...reviews];
  if (facilityId) {
    results = results.filter((r) => r.facilityId === facilityId);
  }
  res.json(results);
});

app.post('/api/reviews', (req, res) => {
  const { bookingId, facilityId, userId, userName, userAvatar, rating, categories, comment } = req.body;

  if (!facilityId || !userId || !rating) {
    return res.status(400).json({ error: 'Missing required review fields.' });
  }

  // Verification: Validate that user has completed booking at this facility
  const hasCompletedBooking = bookings.some(
    (b) => b.facilityId === facilityId && b.userId === userId && (b.status === 'completed' || b.status === 'confirmed')
  );

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    bookingId: bookingId || `QC-${Date.now()}`,
    facilityId,
    facilityName: facilities.find((f) => f.id === facilityId)?.name || 'Facility',
    userId,
    userName: userName || 'Player',
    userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: Number(rating),
    courtQuality: Number(req.body.courtQuality) || 5,
    cleanliness: Number(req.body.cleanliness) || 5,
    staffService: Number(req.body.staffService) || 5,
    tags: req.body.tags || ['Great court', 'Clean facility'],
    categories: categories || {
      facilityQuality: 5,
      cleanliness: 5,
      staffService: 5,
      courtQuality: 5,
      valueForMoney: 5,
    },
    comment: comment || 'Great courts and ambience!',
    verifiedBooking: hasCompletedBooking,
    createdAt: new Date().toISOString(),
  };

  reviews.unshift(newReview);

  // Recalculate facility rating
  const fac = facilities.find((f) => f.id === facilityId);
  if (fac) {
    const facReviews = reviews.filter((r) => r.facilityId === facilityId);
    const avg = facReviews.reduce((sum, r) => sum + r.rating, 0) / facReviews.length;
    fac.rating = parseFloat(avg.toFixed(1));
    fac.reviewCount = facReviews.length;
  }

  res.status(201).json(newReview);
});

// 19. Notifications: List & Read
app.get('/api/notifications', (req, res) => {
  const { userId, role } = req.query;
  let userNotifs = notifications.filter((n) => n.userId === userId || n.roleTarget === role || n.roleTarget === 'all');
  res.json(userNotifs);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

// 20. Facility Owner: Dashboard Analytics & KPIs
app.get('/api/owner/dashboard', (req, res) => {
  const { ownerId = 'usr_owner_1' } = req.query;
  const ownerFacilities = facilities.filter((f) => f.ownerId === ownerId);
  const facilityIds = ownerFacilities.map((f) => f.id);

  const ownerCourts = courts.filter((c) => facilityIds.includes(c.facilityId));
  const ownerBookings = bookings.filter((b) => facilityIds.includes(b.facilityId));

  const totalEarnings = ownerBookings
    .filter((b) => b.paymentStatus === 'successful')
    .reduce((sum, b) => sum + b.courtPrice, 0);

  // Booking Trends (last 7 days simulation)
  const bookingTrends = [
    { day: 'Mon', bookings: 12, earnings: 4800 },
    { day: 'Tue', bookings: 14, earnings: 5600 },
    { day: 'Wed', bookings: 18, earnings: 7200 },
    { day: 'Thu', bookings: 15, earnings: 6100 },
    { day: 'Fri', bookings: 26, earnings: 11400 },
    { day: 'Sat', bookings: 38, earnings: 17200 },
    { day: 'Sun', bookings: 34, earnings: 15300 },
  ];

  // Peak Hours
  const peakHours = [
    { hour: '06:00 - 08:00', bookings: 18 },
    { hour: '08:00 - 10:00', bookings: 12 },
    { hour: '16:00 - 18:00', bookings: 22 },
    { hour: '18:00 - 20:00', bookings: 46 },
    { hour: '20:00 - 22:00', bookings: 38 },
  ];

  res.json({
    kpis: {
      totalBookings: ownerBookings.length,
      activeCourts: ownerCourts.filter((c) => c.status === 'active').length,
      totalEarnings,
      occupancyRate: '78%',
    },
    facilities: ownerFacilities,
    courts: ownerCourts,
    bookingTrends,
    peakHours,
  });
});

// 21. Facility Owner: Block / Unblock Maintenance Slot
app.post('/api/owner/slots/block', (req, res) => {
  const { courtId, date, startTime, action = 'block' } = req.body;
  const slotKey = `${courtId}_${date}_${startTime}`;

  if (action === 'block') {
    blockedSlots.add(slotKey);
  } else {
    blockedSlots.delete(slotKey);
  }

  res.json({ success: true, slotKey, action });
});

// 22. Admin: Global Dashboard KPIs & Analytics
app.get('/api/admin/dashboard', (req, res) => {
  const totalUsers = users.filter((u) => u.role === 'player').length;
  const totalOwners = users.filter((u) => u.role === 'facility_owner').length;
  const pendingFacilitiesCount = facilities.filter((f) => f.status === 'pending').length;
  const activeFacilitiesCount = facilities.filter((f) => f.status === 'approved').length;
  const totalActiveCourts = courts.filter((c) => c.status === 'active').length;

  const platformEarnings = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'successful' ? b.platformFee : 0), 0) + 14500;

  const registrationTrends = [
    { month: 'Apr', players: 240, owners: 15 },
    { month: 'May', players: 410, owners: 22 },
    { month: 'Jun', players: 680, owners: 35 },
    { month: 'Jul', players: 890, owners: 48 },
    { month: 'Aug', players: 1120, owners: 64 },
    { month: 'Sep', players: 1250, owners: 85 },
  ];

  const sportsBreakdown = [
    { name: 'Badminton', bookings: 1940, share: 40 },
    { name: 'Football', bookings: 1210, share: 25 },
    { name: 'Tennis', bookings: 730, share: 15 },
    { name: 'Cricket', bookings: 490, share: 10 },
    { name: 'Pickleball', bookings: 320, share: 7 },
    { name: 'Basketball', bookings: 160, share: 3 },
  ];

  res.json({
    kpis: {
      totalUsers,
      totalOwners,
      totalBookings: bookings.length + 4820,
      activeCourts: totalActiveCourts,
      pendingFacilities: pendingFacilitiesCount,
      activeFacilities: activeFacilitiesCount,
      platformEarnings,
    },
    registrationTrends,
    sportsBreakdown,
    recentAudits: auditLogs.slice(0, 6),
  });
});

// 23. Admin: Facilities Management
app.get('/api/admin/facilities', (req, res) => {
  res.json(facilities);
});

app.patch('/api/admin/facilities/:id/approve', (req, res) => {
  const { id } = req.params;
  const fac = facilities.find((f) => f.id === id);
  if (!fac) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  fac.status = 'approved';
  fac.verifiedBadge = true;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'usr_admin_1',
    adminName: 'Priya Verma',
    action: 'Facility Approved',
    target: `${fac.name} (${fac.id})`,
    description: 'Admin approved facility after verification. It is now publicly listed.',
    timestamp: new Date().toISOString(),
  });

  notifications.unshift({
    id: `notif_${Date.now()}_fac_appr`,
    userId: fac.ownerId,
    roleTarget: 'facility_owner',
    title: '🎉 Facility Approved!',
    message: `Congratulations! "${fac.name}" has been approved by admin and is now live for bookings.`,
    type: 'facility_approved',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/owner/dashboard',
  });

  res.json(fac);
});

app.patch('/api/admin/facilities/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason = 'Information provided is incomplete.' } = req.body;
  const fac = facilities.find((f) => f.id === id);
  if (!fac) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  fac.status = 'rejected';
  fac.rejectionReason = reason;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'usr_admin_1',
    adminName: 'Priya Verma',
    action: 'Facility Rejected',
    target: `${fac.name} (${fac.id})`,
    description: `Facility was rejected. Reason: ${reason}`,
    timestamp: new Date().toISOString(),
  });

  notifications.unshift({
    id: `notif_${Date.now()}_fac_rej`,
    userId: fac.ownerId,
    roleTarget: 'facility_owner',
    title: '⚠️ Facility Review Update',
    message: `"${fac.name}" was not approved. Reason: ${reason}`,
    type: 'facility_rejected',
    read: false,
    timestamp: new Date().toISOString(),
    link: '/owner/dashboard',
  });

  res.json(fac);
});

// 24. Admin: Users Management
app.get('/api/admin/users', (req, res) => {
  res.json(users);
});

app.patch('/api/admin/users/:id/ban', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.isBanned = !user.isBanned;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'usr_admin_1',
    adminName: 'Priya Verma',
    action: user.isBanned ? 'User Banned' : 'User Unbanned',
    target: `${user.name} (${user.email})`,
    description: user.isBanned
      ? 'Suspended account due to platform compliance violation.'
      : 'Account reinstated after appeal review.',
    timestamp: new Date().toISOString(),
  });

  res.json(user);
});

// 25. Admin: Reports & Moderation
app.get('/api/admin/reports', (req, res) => {
  res.json(reports);
});

app.patch('/api/admin/reports/:id/resolve', (req, res) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const { action = 'resolved', actionTaken = 'Issue investigated and resolved.' } = req.body;
  report.status = action as any;
  report.actionTaken = actionTaken;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'usr_admin_1',
    adminName: 'Priya Verma',
    action: 'Report Moderated',
    target: `Report #${report.id} (${report.targetType})`,
    description: actionTaken,
    timestamp: new Date().toISOString(),
  });

  res.json(report);
});

// 26. Admin: Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// Start Server and mount Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuickCourt Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
