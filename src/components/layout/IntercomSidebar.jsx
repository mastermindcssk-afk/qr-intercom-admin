import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Tooltip, Divider, Chip,
} from '@mui/material';
import DashboardRoundedIcon    from '@mui/icons-material/DashboardRounded';
import QrCode2RoundedIcon      from '@mui/icons-material/QrCode2Rounded';
import ListAltRoundedIcon      from '@mui/icons-material/ListAltRounded';
import MeetingRoomRoundedIcon  from '@mui/icons-material/MeetingRoomRounded';
import HistoryRoundedIcon      from '@mui/icons-material/HistoryRounded';
import PeopleAltRoundedIcon    from '@mui/icons-material/PeopleAltRounded';
import ScheduleRoundedIcon     from '@mui/icons-material/ScheduleRounded';
import SettingsRoundedIcon     from '@mui/icons-material/SettingsRounded';
import CallSplitRoundedIcon    from '@mui/icons-material/CallSplitRounded';
import VideocamRoundedIcon     from '@mui/icons-material/VideocamRounded';
import BarChartRoundedIcon     from '@mui/icons-material/BarChartRounded';
import LocationOnRoundedIcon   from '@mui/icons-material/LocationOnRounded';
import BrushRoundedIcon        from '@mui/icons-material/BrushRounded';
import ChevronLeftIcon         from '@mui/icons-material/ChevronLeft';
import MenuIcon                from '@mui/icons-material/Menu';

const FULL = 256;
const MINI = 68;


const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',     path: '/intercom',          icon: <DashboardRoundedIcon />,   exact: true },
      { label: 'Live Activity', path: '/intercom/live',     icon: <VideocamRoundedIcon />,    badge: 'LIVE' },
    ],
  },
  {
    label: 'Access Control',
    items: [
      { label: 'QR Codes',       path: '/intercom/qr',       icon: <QrCode2RoundedIcon /> },
      { label: 'Entry Points',   path: '/intercom/entries',  icon: <MeetingRoomRoundedIcon /> },
      { label: 'Visit Reasons',  path: '/intercom/reasons',  icon: <ListAltRoundedIcon /> },
      { label: 'Routing Rules',  path: '/intercom/routing',  icon: <CallSplitRoundedIcon /> },
      { label: 'Schedules',      path: '/intercom/schedules',icon: <ScheduleRoundedIcon /> },
    ],
  },
  {
    label: 'Records',
    items: [
      { label: 'Access Logs',   path: '/intercom/logs',      icon: <HistoryRoundedIcon /> },
      { label: 'Analytics',     path: '/intercom/analytics', icon: <BarChartRoundedIcon /> },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Staff & Roles', path: '/intercom/staff',     icon: <PeopleAltRoundedIcon /> },
      { label: 'Locations',     path: '/intercom/locations', icon: <LocationOnRoundedIcon /> },
      { label: 'Branding',      path: '/intercom/branding',  icon: <BrushRoundedIcon /> },
      { label: 'Settings',      path: '/intercom/settings',  icon: <SettingsRoundedIcon /> },
    ],
  },
];

export default function IntercomSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const width = collapsed ? MINI : FULL;

  const isActive = (item) => item.exact
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(item.path + '/');

  return (
    <Box sx={{ width: 0, flexShrink: 0 }}> {/* layout uses marginLeft on main column instead */}
      <Box sx={{
        width, height: '100vh', position: 'fixed', top: 0, left: 0,
        background: '#0a0f1e',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.22s ease', overflow: 'hidden', zIndex: 200,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Brand */}
        <Box sx={{
          height: 64, display: 'flex', alignItems: 'center',
          px: collapsed ? 0 : 2.5, gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0, justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2.5, flexShrink: 0,
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
          }}>
            <QrCode2RoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          {!collapsed && (
            <>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800} fontSize={14} color="#f1f5f9" noWrap lineHeight={1.2}>QR Intercom</Typography>
                <Typography fontSize={11} color="rgba(255,255,255,0.35)" noWrap>Admin Console</Typography>
              </Box>
              <Box onClick={onToggle} sx={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', '&:hover': { color: 'rgba(255,255,255,0.7)' } }}>
                <ChevronLeftIcon fontSize="small" />
              </Box>
            </>
          )}
        </Box>
        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <Box onClick={onToggle} sx={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', p: 0.5, borderRadius: 1, '&:hover': { color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)' } }}>
              <MenuIcon fontSize="small" />
            </Box>
          </Box>
        )}

        {/* Nav */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 1,
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 2 },
        }}>
          {NAV_GROUPS.map((group, gi) => (
            <Box key={gi}>
              {!collapsed && (
                <Typography fontSize={9.5} fontWeight={800} color="rgba(255,255,255,0.25)"
                  sx={{ px: 2.5, pt: gi > 0 ? 2 : 1, pb: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {group.label}
                </Typography>
              )}
              {collapsed && gi > 0 && <Divider sx={{ mx: 1, my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />}
              <List dense disablePadding sx={{ px: collapsed ? 0.75 : 1 }}>
                {group.items.map(item => {
                  const active = isActive(item);
                  return (
                    <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right" arrow>
                      <ListItemButton onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: 2, mb: 0.25, minHeight: 40,
                          px: collapsed ? 0 : 1.5,
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          position: 'relative',
                          transition: 'all 0.15s',
                          ...(active ? {
                            background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.15))',
                            '&::before': {
                              content: '""', position: 'absolute', left: 0, top: '15%', bottom: '15%',
                              width: 3, borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg, #0ea5e9, #6366f1)',
                            },
                          } : { '&:hover': { background: 'rgba(255,255,255,0.05)' } }),
                        }}>
                        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 32, color: active ? '#38bdf8' : 'rgba(255,255,255,0.4)', '& svg': { fontSize: 18 } }}>
                          {item.icon}
                        </ListItemIcon>
                        {!collapsed && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#f1f5f9' : 'rgba(255,255,255,0.55)', noWrap: true }}
                          />
                        )}
                        {!collapsed && item.badge && (
                          <Box sx={{ px: 0.75, py: 0.15, borderRadius: 1, bgcolor: '#10b981', fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                            {item.badge}
                          </Box>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>

        {/* Footer */}
        {!collapsed && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', flexShrink: 0,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': { '0%,100%': { boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }, '50%': { boxShadow: '0 0 0 5px rgba(16,185,129,0.05)' } },
              }} />
              <Box>
                <Typography fontSize={12} fontWeight={700} color="#10b981">System Live</Typography>
                <Typography fontSize={10} color="rgba(255,255,255,0.3)">3/4 doors online</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
