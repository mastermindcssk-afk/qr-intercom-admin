import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, Divider,
  Alert, LinearProgress,
} from '@mui/material';
import VideocamRoundedIcon     from '@mui/icons-material/VideocamRounded';
import PhoneDisabledRoundedIcon from '@mui/icons-material/PhoneDisabledRounded';
import LockOpenRoundedIcon     from '@mui/icons-material/LockOpenRounded';
import PersonRoundedIcon       from '@mui/icons-material/PersonRounded';
import AccessTimeRoundedIcon   from '@mui/icons-material/AccessTimeRounded';
import CircleIcon              from '@mui/icons-material/Circle';
import { useSnackbar } from 'notistack';
import { PageLoader, AvatarInitials, StatusChip } from '../../components/common';
import { getLiveSessions, endSession, adminUnlock, getAccessLogs } from '../../utils/api';
import { timeAgo } from '../../utils/helpers';

const STATUS_CONFIG = {
  ringing:  { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Ringing', pulse: true },
  answered: { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', label: 'Answered', pulse: false },
  denied:   { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Denied',   pulse: false },
  'timed-out': { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: 'Timed Out', pulse: false },
};

function LiveSessionCard({ session, onEnd, onUnlock }) {
  const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.ringing;
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(session.startTime).getTime();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [session.startTime]);
  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <Paper elevation={0} sx={{
      borderRadius: 3, border: `1.5px solid ${cfg.border}`, overflow: 'hidden',
      transition: 'all 0.2s',
      ...(cfg.pulse ? { boxShadow: `0 0 0 0 ${cfg.color}33`, animation: 'cardPulse 2s infinite',
        '@keyframes cardPulse': { '0%': { boxShadow: `0 0 0 0 ${cfg.color}33` }, '70%': { boxShadow: `0 0 0 8px ${cfg.color}00` }, '100%': { boxShadow: `0 0 0 0 ${cfg.color}00` } },
      } : {}),
    }}>
      {/* Status bar */}
      <Box sx={{ height: 4, bgcolor: cfg.color }} />

      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AvatarInitials name={session.visitor} size={44} fontSize={16} />
            <Box>
              <Typography fontWeight={800} fontSize={14}>{session.visitor}</Typography>
              <Typography fontSize={12} color="text.secondary">{session.reason}</Typography>
            </Box>
          </Box>
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CircleIcon sx={{ fontSize: 8, color: cfg.color,
              ...(cfg.pulse ? { animation: 'dot 1.5s infinite', '@keyframes dot': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } } : {}) }} />
            <Typography fontSize={12} fontWeight={800} color={cfg.color}>{cfg.label}</Typography>
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box>
            <Typography fontSize={11} color="text.secondary">Entry Point</Typography>
            <Typography fontSize={13} fontWeight={700}>{session.entry}</Typography>
          </Box>
          <Box>
            <Typography fontSize={11} color="text.secondary">Lock ID</Typography>
            <Typography fontSize={13} fontWeight={700} sx={{ fontFamily: 'monospace' }}>{session.lockId}</Typography>
          </Box>
          <Box>
            <Typography fontSize={11} color="text.secondary">Duration</Typography>
            <Typography fontSize={13} fontWeight={700} color={elapsed > 60 ? 'warning.main' : 'text.primary'}>{fmt(elapsed)}</Typography>
          </Box>
        </Box>

        {/* Snapshot placeholder */}
        {session.hasSnapshot && (
          <Box sx={{ height: 100, borderRadius: 2, bgcolor: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1e293b, #334155)' }} />
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <PersonRoundedIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.4)' }} />
              <Typography fontSize={11} color="rgba(255,255,255,0.5)" fontWeight={600}>Visitor Snapshot</Typography>
            </Box>
            <Box sx={{ position: 'absolute', top: 6, right: 6, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'rgba(239,68,68,0.9)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircleIcon sx={{ fontSize: 6, color: '#fff', animation: 'dot 1s infinite', '@keyframes dot': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                <Typography fontSize={9} fontWeight={800} color="#fff">LIVE</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="success" size="small" startIcon={<LockOpenRoundedIcon />}
            onClick={() => onUnlock(session)} sx={{ flex: 1, fontSize: 12 }}>
            Unlock Door
          </Button>
          <Button variant="outlined" color="error" size="small" startIcon={<PhoneDisabledRoundedIcon />}
            onClick={() => onEnd(session)} sx={{ flex: 1, fontSize: 12 }}>
            End Session
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default function LiveActivityPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [sessions, setSessions] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    Promise.all([getLiveSessions(), getAccessLogs()])
      .then(([s, l]) => { setSessions(s); setRecentLogs(l.slice(0, 8)); })
      .finally(() => setLoading(false));
    const iv = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  const handleUnlock = async (session) => {
    await adminUnlock(session.lockId);
    enqueueSnackbar(`${session.entry} unlocked by admin`, { variant: 'success' });
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'answered' } : s));
  };
  const handleEnd = async (session) => {
    await endSession(session.id);
    enqueueSnackbar('Session ended', { variant: 'info' });
    setSessions(prev => prev.filter(s => s.id !== session.id));
  };

  if (loading) return <PageLoader />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" fontWeight={800}>Live Activity</Typography>
            <Box sx={{ px: 1.5, py: 0.25, borderRadius: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CircleIcon sx={{ fontSize: 8, color: '#ef4444', animation: 'blink 1s infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } } }} />
              <Typography fontSize={11} fontWeight={800} color="#ef4444">LIVE</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">Monitor and manage active intercom sessions in real-time</Typography>
        </Box>
      </Box>

      {sessions.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2.5, mb: 3, fontWeight: 500 }}>
          ✅ No active sessions right now. All entry points are quiet.
        </Alert>
      ) : (
        <>
          <Alert severity="warning" sx={{ borderRadius: 2.5, mb: 3, fontWeight: 600 }}>
            {sessions.filter(s => s.status === 'ringing').length} visitor(s) waiting — please respond promptly!
          </Alert>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {sessions.map(s => (
              <Grid item xs={12} sm={6} md={4} key={s.id}>
                <LiveSessionCard session={s} onEnd={handleEnd} onUnlock={handleUnlock} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Recent activity */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography fontWeight={800} fontSize={15}>Recent Activity</Typography>
            <Typography fontSize={12} color="text.secondary">Last {recentLogs.length} sessions</Typography>
          </Box>
          <Chip label="Auto-refreshes" size="small" sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />
        </Box>
        <Box>
          {recentLogs.map((log, i) => (
            <Box key={log.id} sx={{ px: 3, py: 1.75, display: 'flex', alignItems: 'center', gap: 2,
              borderBottom: i < recentLogs.length - 1 ? '1px solid #f1f5f9' : 'none',
              '&:hover': { bgcolor: '#f8fafc' } }}>
              <AvatarInitials name={log.visitor} size={32} fontSize={12} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={13} fontWeight={700} noWrap>{log.visitor}</Typography>
                  <Typography fontSize={12} color="text.secondary" noWrap>— {log.reason}</Typography>
                </Box>
                <Typography fontSize={11} color="text.secondary">{log.entry} · {timeAgo(log.time)}</Typography>
              </Box>
              <StatusChip status={log.status} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
