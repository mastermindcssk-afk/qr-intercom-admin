// ─── Visit Reasons ─────────────────────────────────────────────────────────
export const MOCK_VISIT_REASONS = [
  { id: 'vr1', label: 'Delivery / Package',    icon: '📦', isDefault: true,  active: true,  order: 0, usageCount: 312, routingRule: 'front-desk', notifyRecipients: ['u2'] },
  { id: 'vr2', label: 'Meeting / Appointment', icon: '📅', isDefault: true,  active: true,  order: 1, usageCount: 188, routingRule: 'manager',    notifyRecipients: ['u1','u4'] },
  { id: 'vr3', label: 'Vendor / Contractor',   icon: '🔧', isDefault: true,  active: true,  order: 2, usageCount: 97,  routingRule: 'manager',    notifyRecipients: ['u1'] },
  { id: 'vr4', label: 'Job Interview',         icon: '💼', isDefault: true,  active: true,  order: 3, usageCount: 54,  routingRule: 'manager',    notifyRecipients: ['u1','u4'] },
  { id: 'vr5', label: 'Client Visit',          icon: '🤝', isDefault: true,  active: true,  order: 4, usageCount: 271, routingRule: 'front-desk', notifyRecipients: ['u2','u4'] },
  { id: 'vr6', label: 'Maintenance',           icon: '⚙️', isDefault: true,  active: true,  order: 5, usageCount: 43,  routingRule: 'security',   notifyRecipients: ['u3'] },
  { id: 'vr7', label: 'Food / Catering',       icon: '🍕', isDefault: false, active: true,  order: 6, usageCount: 29,  routingRule: 'front-desk', notifyRecipients: ['u2'] },
  { id: 'vr8', label: 'IT Support',            icon: '💻', isDefault: false, active: false, order: 7, usageCount: 11,  routingRule: 'staff',      notifyRecipients: ['u5'] },
];

// ─── Entry Points / QR Codes ───────────────────────────────────────────────
export const MOCK_ENTRY_POINTS = [
  { id: 'ep1', name: 'Main Entrance',  lockId: 'LOCK_001', online: true,  location: 'Front of Building A',  sessions: 234, lastSeen: 'Just now',    alertRecipients: ['u1','u2','u3'], schedule: 'sch1', qrStatus: 'active',   qrGenerated: '2025-06-01T10:00:00', lastScanned: '2025-07-14T09:02:00', autoUnlock: false, visitReasons: ['vr1','vr2','vr5'] },
  { id: 'ep2', name: 'Lobby B',        lockId: 'LOCK_002', online: true,  location: 'West Wing, Floor 1',   sessions: 87,  lastSeen: '2 min ago',   alertRecipients: ['u2','u4'],      schedule: 'sch2', qrStatus: 'active',   qrGenerated: '2025-06-15T14:30:00', lastScanned: '2025-07-14T08:48:00', autoUnlock: false, visitReasons: ['vr2','vr3','vr4'] },
  { id: 'ep3', name: 'Back Door',      lockId: 'LOCK_003', online: false, location: 'Rear Parking Level',   sessions: 41,  lastSeen: '3 days ago',  alertRecipients: ['u1'],           schedule: null,   qrStatus: 'disabled', qrGenerated: '2025-05-20T09:00:00', lastScanned: '2025-07-11T14:22:00', autoUnlock: false, visitReasons: ['vr6'] },
  { id: 'ep4', name: 'Delivery Gate',  lockId: 'LOCK_004', online: true,  location: 'Loading Dock East',    sessions: 112, lastSeen: '14 min ago',  alertRecipients: ['u3','u4'],      schedule: 'sch1', qrStatus: 'active',   qrGenerated: '2025-06-10T11:00:00', lastScanned: '2025-07-14T08:55:00', autoUnlock: true,  visitReasons: ['vr1','vr7'] },
];

// ─── Staff / Users ─────────────────────────────────────────────────────────
export const MOCK_STAFF = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@nexkey.com',  role: 'Manager',    phone: '+1 555-0101', active: true,  permissions: { receiveAlerts: true,  unlockDoors: true,  viewLogs: true,  configureQR: true  }, locations: ['ep1','ep2','ep3','ep4'] },
  { id: 'u2', name: 'Maria Garcia', email: 'maria@nexkey.com', role: 'Front Desk', phone: '+1 555-0102', active: true,  permissions: { receiveAlerts: true,  unlockDoors: true,  viewLogs: true,  configureQR: false }, locations: ['ep1','ep2'] },
  { id: 'u3', name: 'Devon Clarke', email: 'devon@nexkey.com', role: 'Security',   phone: '+1 555-0103', active: true,  permissions: { receiveAlerts: true,  unlockDoors: true,  viewLogs: true,  configureQR: false }, locations: ['ep1','ep3','ep4'] },
  { id: 'u4', name: 'Priya Nair',   email: 'priya@nexkey.com', role: 'Admin',      phone: '+1 555-0104', active: true,  permissions: { receiveAlerts: true,  unlockDoors: true,  viewLogs: true,  configureQR: true  }, locations: ['ep1','ep2','ep4'] },
  { id: 'u5', name: 'Sam Torres',   email: 'sam@nexkey.com',   role: 'Staff',      phone: '+1 555-0105', active: false, permissions: { receiveAlerts: false, unlockDoors: false, viewLogs: false, configureQR: false }, locations: ['ep2'] },
];

// ─── Schedules ─────────────────────────────────────────────────────────────
export const MOCK_SCHEDULES = [
  { id: 'sch1', name: 'Business Hours',   days: [1,2,3,4,5], startTime: '08:00', endTime: '18:00', afterHoursBehavior: 'disable', afterHoursMessage: 'We are closed. Please call +1 555-0100.', assignedDoors: ['ep1','ep4'] },
  { id: 'sch2', name: 'Extended Hours',   days: [1,2,3,4,5], startTime: '07:00', endTime: '20:00', afterHoursBehavior: 'security', afterHoursMessage: 'After hours access. Security will respond.', assignedDoors: ['ep2'] },
  { id: 'sch3', name: 'Weekend Only',     days: [0,6],        startTime: '09:00', endTime: '17:00', afterHoursBehavior: 'voicemail', afterHoursMessage: 'Leave a message and we will get back to you.', assignedDoors: [] },
];

// ─── Routing Rules ─────────────────────────────────────────────────────────
export const MOCK_ROUTING_RULES = [
  { id: 'rr1', name: 'Manager Route',    primaryRecipients: ['u1'], fallbackRecipients: ['u4'], fallbackDelay: 30, autoDenyAfterRings: 5, voicemailOnMiss: true,  entryPoints: ['ep1','ep2'], active: true  },
  { id: 'rr2', name: 'Front Desk Route', primaryRecipients: ['u2'], fallbackRecipients: ['u1'], fallbackDelay: 20, autoDenyAfterRings: 4, voicemailOnMiss: true,  entryPoints: ['ep1'],      active: true  },
  { id: 'rr3', name: 'Security Route',   primaryRecipients: ['u3'], fallbackRecipients: ['u1'], fallbackDelay: 15, autoDenyAfterRings: 3, voicemailOnMiss: false, entryPoints: ['ep3','ep4'], active: true  },
];

// ─── Access Logs ───────────────────────────────────────────────────────────
export const MOCK_ACCESS_LOGS = [
  { id: 'log1',  visitor: 'James Porter',  reason: 'Delivery / Package',    entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-14T09:02:00', status: 'granted',   staffName: 'Maria Garcia', duration: '1m 12s', hasSnapshot: true  },
  { id: 'log2',  visitor: 'Sarah Kim',     reason: 'Client Visit',          entry: 'Lobby B',       lockId: 'LOCK_002', time: '2025-07-14T08:48:00', status: 'granted',   staffName: 'Alex Johnson', duration: '2m 05s', hasSnapshot: true  },
  { id: 'log3',  visitor: 'Unknown',       reason: 'Vendor / Contractor',   entry: 'Back Door',     lockId: 'LOCK_003', time: '2025-07-14T08:21:00', status: 'denied',    staffName: 'Devon Clarke', duration: '0m 34s', hasSnapshot: false },
  { id: 'log4',  visitor: 'Tom Ellis',     reason: 'Meeting / Appointment', entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-14T07:55:00', status: 'voicemail', staffName: null,           duration: '0m 48s', hasSnapshot: true  },
  { id: 'log5',  visitor: 'Maria Lopez',   reason: 'Delivery / Package',    entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-14T07:30:00', status: 'granted',   staffName: 'Priya Nair',   duration: '1m 22s', hasSnapshot: true  },
  { id: 'log6',  visitor: 'Devon Clarke',  reason: 'Job Interview',         entry: 'Lobby B',       lockId: 'LOCK_002', time: '2025-07-13T16:45:00', status: 'granted',   staffName: 'Alex Johnson', duration: '3m 10s', hasSnapshot: true  },
  { id: 'log7',  visitor: 'Lisa Brown',    reason: 'Maintenance',           entry: 'Delivery Gate', lockId: 'LOCK_004', time: '2025-07-13T14:20:00', status: 'granted',   staffName: 'Devon Clarke', duration: '0m 55s', hasSnapshot: false },
  { id: 'log8',  visitor: 'Raj Patel',     reason: 'Food / Catering',       entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-13T12:10:00', status: 'granted',   staffName: 'Maria Garcia', duration: '1m 01s', hasSnapshot: true  },
  { id: 'log9',  visitor: 'Unknown',       reason: 'Client Visit',          entry: 'Delivery Gate', lockId: 'LOCK_004', time: '2025-07-13T11:05:00', status: 'denied',    staffName: 'Alex Johnson', duration: '0m 18s', hasSnapshot: false },
  { id: 'log10', visitor: 'Emma Wilson',   reason: 'Meeting / Appointment', entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-13T10:00:00', status: 'voicemail', staffName: null,           duration: '1m 12s', hasSnapshot: true  },
  { id: 'log11', visitor: 'Chris Park',    reason: 'Delivery / Package',    entry: 'Delivery Gate', lockId: 'LOCK_004', time: '2025-07-12T15:30:00', status: 'granted',   staffName: 'Devon Clarke', duration: '0m 44s', hasSnapshot: true  },
  { id: 'log12', visitor: 'Nina Patel',    reason: 'Client Visit',          entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-12T13:00:00', status: 'granted',   staffName: 'Priya Nair',   duration: '2m 30s', hasSnapshot: true  },
  { id: 'log13', visitor: 'Omar Hassan',   reason: 'Job Interview',         entry: 'Lobby B',       lockId: 'LOCK_002', time: '2025-07-12T10:00:00', status: 'granted',   staffName: 'Alex Johnson', duration: '4m 20s', hasSnapshot: true  },
  { id: 'log14', visitor: 'Yuki Tanaka',   reason: 'Vendor / Contractor',   entry: 'Main Entrance', lockId: 'LOCK_001', time: '2025-07-11T15:45:00', status: 'denied',    staffName: 'Devon Clarke', duration: '0m 22s', hasSnapshot: false },
  { id: 'log15', visitor: 'Sophie Turner', reason: 'Delivery / Package',    entry: 'Delivery Gate', lockId: 'LOCK_004', time: '2025-07-11T14:00:00', status: 'granted',   staffName: 'Maria Garcia', duration: '0m 58s', hasSnapshot: true  },
];

// ─── Live Sessions ─────────────────────────────────────────────────────────
export const MOCK_LIVE_SESSIONS = [
  { id: 'live1', visitor: 'John Doe',    reason: 'Meeting / Appointment', entry: 'Main Entrance', lockId: 'LOCK_001', status: 'ringing',  startTime: '2025-07-14T09:10:00', hasSnapshot: true  },
  { id: 'live2', visitor: 'Anna Bell',   reason: 'Delivery / Package',    entry: 'Delivery Gate', lockId: 'LOCK_004', status: 'answered', startTime: '2025-07-14T09:08:00', hasSnapshot: true  },
];

// ─── Dashboard Stats ───────────────────────────────────────────────────────
export const MOCK_STATS = {
  todayVisitors:   41,
  todayGranted:    34,
  todayDenied:     5,
  todayVoicemail:  2,
  todayMissed:     3,
  weekVisitors:    187,
  monthVisitors:   724,
  avgResponseTime: '48s',
  onlineEntries:   3,
  totalEntries:    4,
  missedCallRate:  7.3,
  peakHour:        '10:00 AM',
};

// ─── Analytics Data ────────────────────────────────────────────────────────
export const MOCK_HOURLY = [
  { hour: '6am', visitors: 2 }, { hour: '7am', visitors: 5 }, { hour: '8am', visitors: 12 },
  { hour: '9am', visitors: 18 }, { hour: '10am', visitors: 24 }, { hour: '11am', visitors: 19 },
  { hour: '12pm', visitors: 14 }, { hour: '1pm', visitors: 16 }, { hour: '2pm', visitors: 21 },
  { hour: '3pm', visitors: 17 }, { hour: '4pm', visitors: 13 }, { hour: '5pm', visitors: 8 },
  { hour: '6pm', visitors: 3 }, { hour: '7pm', visitors: 1 },
];

export const MOCK_WEEKLY = [
  { day: 'Mon', visitors: 28, granted: 24, denied: 3 },
  { day: 'Tue', visitors: 35, granted: 30, denied: 4 },
  { day: 'Wed', visitors: 41, granted: 34, denied: 5 },
  { day: 'Thu', visitors: 38, granted: 32, denied: 4 },
  { day: 'Fri', visitors: 45, granted: 38, denied: 6 },
  { day: 'Sat', visitors: 12, granted: 10, denied: 1 },
  { day: 'Sun', visitors: 8,  granted: 7,  denied: 1 },
];

export const MOCK_DOOR_STATS = [
  { name: 'Main Entrance',  scans: 234, missedRate: 4.2, avgResponse: '42s' },
  { name: 'Lobby B',        scans: 87,  missedRate: 6.8, avgResponse: '55s' },
  { name: 'Delivery Gate',  scans: 112, missedRate: 3.5, avgResponse: '38s' },
  { name: 'Back Door',      scans: 41,  missedRate: 12.1, avgResponse: '1m 2s' },
];

export const MOCK_LOCATIONS = [
  { id: 'loc1', name: 'Building A – HQ',    address: '100 Main St, San Francisco, CA', doors: 2, staff: 3, totalScans: 346 },
  { id: 'loc2', name: 'Building B – Annex', address: '200 Park Ave, San Francisco, CA', doors: 1, staff: 2, totalScans: 87  },
  { id: 'loc3', name: 'Warehouse East',     address: '500 Industrial Blvd, Oakland, CA', doors: 1, staff: 1, totalScans: 41  },
];

export const EMOJI_OPTIONS = [
  '📦','📅','🔧','💼','🤝','⚙️','🍕','💻','🚚','🏥','🎓','🛒',
  '📋','🔑','🖨️','🧹','📬','🔔','👷','🛠️','🏢','🚗','✉️','🎯',
  '🧑‍💼','🪪','📸','🔐','🏗️','🎁','🧾','📊',
];
