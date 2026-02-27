import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, Divider, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, LinearProgress, Alert,
} from '@mui/material';
import CircleIcon          from '@mui/icons-material/Circle';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useNavigate } from 'react-router-dom';
import { StatCard, AvatarInitials, StatusChip, PageLoader } from '../../components/common';
import { getDashboardStats, getAccessLogs, getEntryPoints, getLiveSessions } from '../../utils/api';
import { timeAgo } from '../../utils/helpers';

export default function IntercomDashboard() {
  const [stats,    setStats]    = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [entries,  setEntries]  = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboardStats(), getAccessLogs(), getEntryPoints(), getLiveSessions()])
      .then(([s, l, e, sv]) => { setStats(s); setLogs(l.slice(0, 7)); setEntries(e); setSessions(sv); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const uptimePct = Math.round((stats.onlineEntries / stats.totalEntries) * 100);
  const grantRate = Math.round((stats.todayGranted / stats.todayVisitors) * 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Live sessions alert */}
      {sessions.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: 2.5, fontWeight: 500, border: '1px solid #fde68a' }}
          action={<Button size="small" color="warning" onClick={() => navigate('/intercom/live')} endIcon={<ArrowForwardRoundedIcon />}>View Live</Button>}>
          🔔 <strong>{sessions.filter(s => s.status === 'ringing').length} visitor(s)</strong> are waiting at entry points right now!
        </Alert>
      )}
      {stats.onlineEntries < stats.totalEntries && (
        <Alert severity="error" sx={{ borderRadius: 2.5, fontWeight: 500, border: '1px solid #fecaca' }}>
          ⚠️ {stats.totalEntries - stats.onlineEntries} entry point(s) are currently offline. Check controller connections.
        </Alert>
      )}

      {/* Page header */}
      <Box>
        <Typography variant="h5" fontWeight={800} mb={0.5}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Real-time overview of all visitor activity</Typography>
      </Box>

      {/* KPI Stats */}
      <Grid container spacing={2}>
        {[
          { icon: '👥', value: stats.todayVisitors,  label: 'Visitors Today',   sub: 'All entry points',            accent: '#0ea5e9' },
          { icon: '✅', value: stats.todayGranted,   label: 'Access Granted',   sub: `${grantRate}% grant rate`,    accent: '#10b981' },
          { icon: '🚫', value: stats.todayDenied,    label: 'Access Denied',    sub: 'Requires review',             accent: '#ef4444' },
          { icon: '📬', value: stats.todayVoicemail, label: 'Voicemails',       sub: 'Check inbox',                 accent: '#f59e0b' },
          { icon: '⚡', value: stats.avgResponseTime,label: 'Avg Response',     sub: 'Staff pickup time',           accent: '#6366f1' },
          { icon: '🏢', value: `${stats.onlineEntries}/${stats.totalEntries}`, label: 'Entries Online', sub: `${uptimePct}% uptime`, accent: uptimePct === 100 ? '#10b981' : '#f59e0b' },
        ].map((c, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <StatCard icon={c.icon} value={c.value} label={c.label} sub={c.sub} accentColor={c.accent} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent logs */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box>
                <Typography fontWeight={800} fontSize={15}>Recent Visitors</Typography>
                <Typography fontSize={12} color="text.secondary">Latest activity</Typography>
              </Box>
              <Chip label="View all →" size="small" clickable onClick={() => navigate('/intercom/logs')}
                sx={{ fontSize: 12, fontWeight: 600, bgcolor: 'primary.50', color: 'primary.main', border: '1px solid', borderColor: 'primary.100' }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Visitor', 'Reason', 'Entry Point', 'Time', 'Status'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id} hover sx={{ '& td': { fontSize: 13, borderBottom: '1px solid #f1f5f9' }, '&:last-child td': { borderBottom: 'none' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <AvatarInitials name={log.visitor} size={28} fontSize={11} />
                          <Typography fontSize={13} fontWeight={600}>{log.visitor}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{log.reason}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{log.entry}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{timeAgo(log.time)}</TableCell>
                      <TableCell><StatusChip status={log.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Entry Points status */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography fontWeight={800} fontSize={15}>Entry Points</Typography>
                  <Typography fontSize={12} color="text.secondary">Controller status</Typography>
                </Box>
                <Chip label="Manage →" size="small" clickable onClick={() => navigate('/intercom/entries')}
                  sx={{ fontSize: 11, fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {entries.map(ep => (
                  <Box key={ep.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        bgcolor: ep.online ? '#10b981' : '#cbd5e1',
                        boxShadow: ep.online ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none' }} />
                      <Typography fontSize={13} fontWeight={700} flex={1}>{ep.name}</Typography>
                      <Typography fontSize={11} color="text.secondary">{ep.sessions} sessions</Typography>
                    </Box>
                    <LinearProgress variant="determinate"
                      value={ep.online ? Math.min((ep.sessions / 250) * 100, 100) : 0}
                      sx={{ height: 5, borderRadius: 3, bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: ep.online ? '#0ea5e9' : '#e2e8f0', borderRadius: 3 } }}
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="primary.main">{stats.weekVisitors}</Typography>
                  <Typography variant="caption" color="text.secondary">This week</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="h5" fontWeight={800} color="success.main">{stats.todayGranted}</Typography>
                  <Typography variant="caption" color="text.secondary">Granted</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="h5" fontWeight={800} color="error.main">{stats.todayDenied}</Typography>
                  <Typography variant="caption" color="text.secondary">Denied</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Quick links */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
              <Typography fontWeight={800} fontSize={15} mb={2}>Quick Access</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: '🔴 Live Activity', path: '/intercom/live', badge: sessions.length > 0 ? `${sessions.length} active` : null },
                  { label: '🔲 QR Codes',       path: '/intercom/qr' },
                  { label: '🔀 Routing Rules',  path: '/intercom/routing' },
                  { label: '📊 Analytics',      path: '/intercom/analytics' },
                ].map(item => (
                  <Box key={item.path} onClick={() => navigate(item.path)} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25,
                    borderRadius: 2, border: '1px solid #f1f5f9', cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#e2e8f0' }, transition: 'all 0.15s',
                  }}>
                    <Typography fontSize={13} fontWeight={600}>{item.label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.badge && <Chip label={item.badge} size="small" color="warning" sx={{ fontSize: 10, height: 20 }} />}
                      <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
