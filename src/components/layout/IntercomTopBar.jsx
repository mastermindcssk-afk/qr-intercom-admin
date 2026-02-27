import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Chip, Breadcrumbs, Link, IconButton, Tooltip } from '@mui/material';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import OpenInNewRoundedIcon         from '@mui/icons-material/OpenInNewRounded';
import HelpOutlineRoundedIcon       from '@mui/icons-material/HelpOutlineRounded';

const CRUMB_MAP = {
  '/intercom':           ['QR Intercom', 'Dashboard'],
  '/intercom/live':      ['QR Intercom', 'Live Activity'],
  '/intercom/qr':        ['QR Intercom', 'QR Codes'],
  '/intercom/entries':   ['QR Intercom', 'Entry Points'],
  '/intercom/reasons':   ['QR Intercom', 'Visit Reasons'],
  '/intercom/routing':   ['QR Intercom', 'Routing Rules'],
  '/intercom/schedules': ['QR Intercom', 'Schedules'],
  '/intercom/logs':      ['QR Intercom', 'Access Logs'],
  '/intercom/analytics': ['QR Intercom', 'Analytics'],
  '/intercom/staff':     ['QR Intercom', 'Staff & Roles'],
  '/intercom/locations': ['QR Intercom', 'Locations'],
  '/intercom/branding':  ['QR Intercom', 'Branding'],
  '/intercom/settings':  ['QR Intercom', 'Settings'],
};

export default function IntercomTopBar() {
  const { pathname } = useLocation();
  const crumbs = CRUMB_MAP[pathname] || ['QR Intercom'];
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        left: 'auto',
        right: 0,
        width: '100%',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: 100,
      }}
    >
      <Toolbar sx={{ minHeight: '60px !important', gap: 2, px: 3 }}>
        <Breadcrumbs sx={{ flex: 1 }} separator="›">
          {crumbs.map((c, i) =>
            i < crumbs.length - 1
              ? <Link key={c} component={RouterLink} to="/intercom" underline="hover" sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>{c}</Link>
              : <Typography key={c} sx={{ fontSize: 13, fontWeight: 700 }}>{c}</Typography>
          )}
        </Breadcrumbs>
        <Chip size="small" label="Live" sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: 11, height: 26, border: '1px solid #bbf7d0' }}
          icon={<Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#22c55e', ml: '8px !important',
            animation: 'blink 2s infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />}
        />
        <Tooltip title="Open visitor portal">
          <IconButton size="small" href="https://visit.nexkey.com/entry/LOCK_001" target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary' }}>
            <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Help">
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <HelpOutlineRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
