import {
  MOCK_VISIT_REASONS, MOCK_ENTRY_POINTS, MOCK_STAFF,
  MOCK_SCHEDULES, MOCK_ACCESS_LOGS, MOCK_STATS,
  MOCK_ROUTING_RULES, MOCK_LIVE_SESSIONS,
  MOCK_HOURLY, MOCK_WEEKLY, MOCK_DOOR_STATS, MOCK_LOCATIONS,
} from '../mock/data';

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ── Visit Reasons ──────────────────────────────────────────────
export const getVisitReasons     = async () => { await delay(); return [...MOCK_VISIT_REASONS]; };
export const createVisitReason   = async (p) => { await delay(300); return { ...p, id: 'vr_' + Date.now(), usageCount: 0 }; };
export const updateVisitReason   = async (id, p) => { await delay(300); return { id, ...p }; };
export const deleteVisitReason   = async () => { await delay(300); return { success: true }; };
export const reorderVisitReasons = async () => { await delay(200); return { success: true }; };

// ── Entry Points / QR ──────────────────────────────────────────
export const getEntryPoints   = async () => { await delay(); return [...MOCK_ENTRY_POINTS]; };
export const createEntryPoint = async (p) => { await delay(300); return { ...p, id: 'ep_' + Date.now(), online: false, sessions: 0, lastSeen: 'Never', qrStatus: 'active', qrGenerated: new Date().toISOString(), lastScanned: null, autoUnlock: false }; };
export const updateEntryPoint = async (id, p) => { await delay(300); return { id, ...p }; };
export const deleteEntryPoint = async () => { await delay(300); return { success: true }; };
export const regenerateQRCode = async (lockId) => { await delay(600); return { qrUrl: `https://visit.nexkey.com/entry/${lockId}?t=${Date.now()}` }; };
export const revokeQRCode     = async (lockId) => { await delay(400); return { success: true }; };

// ── Staff ──────────────────────────────────────────────────────
export const getStaff          = async () => { await delay(); return [...MOCK_STAFF]; };
export const createStaffMember = async (p) => { await delay(300); return { ...p, id: 'u_' + Date.now() }; };
export const updateStaffMember = async (id, p) => { await delay(300); return { id, ...p }; };
export const deleteStaffMember = async () => { await delay(300); return { success: true }; };

// ── Schedules ──────────────────────────────────────────────────
export const getSchedules    = async () => { await delay(); return [...MOCK_SCHEDULES]; };
export const createSchedule  = async (p) => { await delay(300); return { ...p, id: 'sch_' + Date.now() }; };
export const updateSchedule  = async (id, p) => { await delay(300); return { id, ...p }; };
export const deleteSchedule  = async () => { await delay(300); return { success: true }; };

// ── Routing Rules ──────────────────────────────────────────────
export const getRoutingRules   = async () => { await delay(); return [...MOCK_ROUTING_RULES]; };
export const createRoutingRule = async (p) => { await delay(300); return { ...p, id: 'rr_' + Date.now(), active: true }; };
export const updateRoutingRule = async (id, p) => { await delay(300); return { id, ...p }; };
export const deleteRoutingRule = async () => { await delay(300); return { success: true }; };

// ── Access Logs ────────────────────────────────────────────────
export const getAccessLogs    = async () => { await delay(); return [...MOCK_ACCESS_LOGS]; };
export const exportAccessLogs = async () => { await delay(800); return { success: true }; };

// ── Live Sessions ──────────────────────────────────────────────
export const getLiveSessions = async () => { await delay(200); return [...MOCK_LIVE_SESSIONS]; };
export const endSession      = async (id) => { await delay(300); return { success: true }; };
export const adminUnlock     = async (lockId) => { await delay(500); return { success: true }; };

// ── Dashboard Stats ────────────────────────────────────────────
export const getDashboardStats = async () => { await delay(200); return { ...MOCK_STATS }; };

// ── Analytics ─────────────────────────────────────────────────
export const getHourlyData  = async () => { await delay(300); return [...MOCK_HOURLY]; };
export const getWeeklyData  = async () => { await delay(300); return [...MOCK_WEEKLY]; };
export const getDoorStats   = async () => { await delay(300); return [...MOCK_DOOR_STATS]; };

// ── Locations ─────────────────────────────────────────────────
export const getLocations   = async () => { await delay(); return [...MOCK_LOCATIONS]; };
export const createLocation = async (p) => { await delay(300); return { ...p, id: 'loc_' + Date.now(), doors: 0, staff: 0, totalScans: 0 }; };
export const updateLocation = async (id, p) => { await delay(300); return { id, ...p }; };
export const deleteLocation = async () => { await delay(300); return { success: true }; };
