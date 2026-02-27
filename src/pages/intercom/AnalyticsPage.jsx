import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Divider, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import TrendingDownIcon    from '@mui/icons-material/TrendingDown';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { PageLoader } from '../../components/common';
import { getDashboardStats, getHourlyData, getWeeklyData, getDoorStats } from '../../utils/api';

function MiniBarChart({ data, valueKey, colorBar = '#0ea5e9', maxVal }) {
  const max = maxVal || Math.max(...data.map(d => d[valueKey]));
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 80 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: '100%', height: `${(d[valueKey] / max) * 64}px`, minHeight: 2, borderRadius: '3px 3px 0 0',
            bgcolor: colorBar, opacity: 0.8, transition: 'height 0.4s ease', '&:hover': { opacity: 1 } }} />
          <Typography fontSize={9} color="text.secondary" fontWeight={600} noWrap>{d.hour || d.day}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function StatCard({ label, value, sub, color = '#0ea5e9', bg = '#f0f9ff', trend, trendUp }) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider',
      transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography fontSize={12} color="text.secondary" fontWeight={600}>{label}</Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, px: 0.75, py: 0.25, borderRadius: 1,
            bgcolor: trendUp ? '#f0fdf4' : '#fef2f2', color: trendUp ? '#15803d' : '#dc2626' }}>
            {trendUp ? <TrendingUpIcon sx={{ fontSize: 13 }} /> : <TrendingDownIcon sx={{ fontSize: 13 }} />}
            <Typography fontSize={11} fontWeight={700}>{trend}</Typography>
          </Box>
        )}
      </Box>
      <Typography variant="h4" fontWeight={800} color="text.primary" fontSize="1.75rem">{value}</Typography>
      {sub && <Typography fontSize={12} color="text.secondary" mt={0.5}>{sub}</Typography>}
    </Paper>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats]   = useState(null);
  const [hourly, setHourly] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [doors, setDoors]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    Promise.all([getDashboardStats(), getHourlyData(), getWeeklyData(), getDoorStats()])
      .then(([s, h, w, d]) => { setStats(s); setHourly(h); setWeekly(w); setDoors(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const grantRate = Math.round((stats.todayGranted / stats.todayVisitors) * 100);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Analytics & Insights</Typography>
          <Typography variant="body2" color="text.secondary">Operational performance across all entry points</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Period</InputLabel>
          <Select label="Period" value={period} onChange={e => setPeriod(e.target.value)}>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total Visitors" value={stats.weekVisitors} sub="This week" trend="+12%" trendUp={true} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Grant Rate" value={`${grantRate}%`} sub="Approved access" trend="+2%" trendUp={true} color="#10b981" bg="#f0fdf4" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Missed Calls" value={`${stats.missedCallRate}%`} sub="Unanswered" trend="-1.2%" trendUp={true} color="#f59e0b" bg="#fffbeb" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Avg Response" value={stats.avgResponseTime} sub="Staff pickup" trend="-4s" trendUp={true} color="#6366f1" bg="#faf5ff" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Peak Hour" value={stats.peakHour} sub="Most activity" color="#0ea5e9" bg="#f0f9ff" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Monthly Total" value={stats.monthVisitors} sub="Visitors" trend="+8%" trendUp={true} color="#ec4899" bg="#fdf2f8" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Hourly Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
              <Box>
                <Typography fontWeight={800} fontSize={15}>Today's Traffic</Typography>
                <Typography fontSize={12} color="text.secondary">Hourly visitor count</Typography>
              </Box>
              <Chip label="Today" size="small" sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />
            </Box>
            <MiniBarChart data={hourly} valueKey="visitors" colorBar="#0ea5e9" />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} fontSize={18} color="primary.main">{Math.max(...hourly.map(h => h.visitors))}</Typography>
                <Typography fontSize={11} color="text.secondary">Peak</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} fontSize={18} color="text.primary">{hourly.reduce((s, h) => s + h.visitors, 0)}</Typography>
                <Typography fontSize={11} color="text.secondary">Total</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} fontSize={18} color="text.primary">{Math.round(hourly.reduce((s, h) => s + h.visitors, 0) / hourly.filter(h => h.visitors > 0).length)}</Typography>
                <Typography fontSize={11} color="text.secondary">Avg/hr</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
              <Box>
                <Typography fontWeight={800} fontSize={15}>Weekly Breakdown</Typography>
                <Typography fontSize={12} color="text.secondary">Granted vs Denied</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: '#10b981' }} /><Typography fontSize={11} color="text.secondary">Granted</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 10, height: 10, borderRadius: 2, bgcolor: '#ef4444' }} /><Typography fontSize={11} color="text.secondary">Denied</Typography></Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 80 }}>
              {weekly.map((d, i) => {
                const max = Math.max(...weekly.map(x => x.visitors));
                return (
                  <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: '100%', position: 'relative', height: `${(d.visitors / max) * 64}px`, minHeight: 4 }}>
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', borderRadius: '3px 3px 0 0', bgcolor: '#10b981', opacity: 0.85 }} />
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(d.denied / d.visitors) * 100}%`, borderRadius: '3px 3px 0 0', bgcolor: '#ef4444', opacity: 0.85 }} />
                    </Box>
                    <Typography fontSize={9} color="text.secondary" fontWeight={600}>{d.day}</Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} fontSize={18} color="success.main">{weekly.reduce((s, d) => s + d.granted, 0)}</Typography>
                <Typography fontSize={11} color="text.secondary">Granted</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} fontSize={18} color="error.main">{weekly.reduce((s, d) => s + d.denied, 0)}</Typography>
                <Typography fontSize={11} color="text.secondary">Denied</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight={800} fontSize={18} color="text.primary">{weekly.reduce((s, d) => s + d.visitors, 0)}</Typography>
                <Typography fontSize={11} color="text.secondary">Total</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Door Performance */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography fontWeight={800} fontSize={15}>Door Performance</Typography>
          <Typography fontSize={12} color="text.secondary">Most-used doors, missed call rates, and response times</Typography>
        </Box>
        <Box>
          {doors.map((door, i) => {
            const maxScans = Math.max(...doors.map(d => d.scans));
            return (
              <Box key={i} sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap',
                borderBottom: i < doors.length - 1 ? '1px solid #f1f5f9' : 'none',
                '&:hover': { bgcolor: '#f8fafc' } }}>
                <Box sx={{ minWidth: 160 }}>
                  <Typography fontSize={13} fontWeight={700}>{door.name}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 120 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography fontSize={11} color="text.secondary">Scans</Typography>
                    <Typography fontSize={11} fontWeight={700}>{door.scans}</Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9' }}>
                    <Box sx={{ height: '100%', borderRadius: 3, bgcolor: '#0ea5e9', width: `${(door.scans / maxScans) * 100}%`, transition: 'width 0.4s' }} />
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography fontSize={14} fontWeight={800} color={parseFloat(door.missedRate) > 10 ? 'error.main' : parseFloat(door.missedRate) > 5 ? 'warning.main' : 'success.main'}>
                    {door.missedRate}%
                  </Typography>
                  <Typography fontSize={11} color="text.secondary">Missed</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography fontSize={14} fontWeight={800} color="text.primary">{door.avgResponse}</Typography>
                  <Typography fontSize={11} color="text.secondary">Avg Response</Typography>
                </Box>
                <Chip label={parseFloat(door.missedRate) > 10 ? 'Needs Attention' : 'Good'} size="small"
                  sx={{ fontWeight: 700, fontSize: 10, height: 22, bgcolor: parseFloat(door.missedRate) > 10 ? '#fef2f2' : '#f0fdf4', color: parseFloat(door.missedRate) > 10 ? '#dc2626' : '#15803d', border: `1px solid ${parseFloat(door.missedRate) > 10 ? '#fecaca' : '#bbf7d0'}` }} />
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
