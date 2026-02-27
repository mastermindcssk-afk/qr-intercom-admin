import React from 'react';
import {
  Chip, Box, Typography, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export function StatusChip({ status }) {
  const map = {
    granted:   { label: 'Granted',   bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    denied:    { label: 'Denied',    bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    voicemail: { label: 'Voicemail', bg: '#fffbeb', color: '#ec8208', border: '#fde68a' },
    missed:    { label: 'Missed',    bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    online:    { label: 'Online',    bg: '#f0fdf4', color: '#00f75a', border: '#bbf7d0' },
    offline:   { label: 'Offline',   bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  };
  const m = map[status] || { label: status, bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
  return (
    <Chip
      label={m.label}
      size="small"
      sx={{
        fontSize: 11,
        fontWeight: 700,
        height: 22,
        bgcolor: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        borderRadius: 6,
      }}
    />
  );
}

export function AvatarInitials({ name, size = 36, fontSize = 14, sx = {} }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const palette = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const color   = palette[(name?.charCodeAt(0) ?? 0) % palette.length];
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}cc, ${color})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize, flexShrink: 0,
      userSelect: 'none',
      boxShadow: `0 2px 8px ${color}40`,
      ...sx,
    }}>
      {initials}
    </Box>
  );
}

export function StatCard({ icon, value, label, sub, accentColor = '#0ea5e9', trend }) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
        transform: 'translateY(-1px)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: accentColor,
        borderRadius: '12px 12px 0 0',
      },
    }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: 2,
        bgcolor: `${accentColor}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, lineHeight: 1, mb: 0.5,
      }}>
        {icon}
      </Box>
      <Typography variant="h4" fontWeight={800} lineHeight={1} fontSize="1.75rem" color="text.primary">
        {value}
      </Typography>
      <Typography fontSize={13} fontWeight={600} color="text.primary" mt={0.25}>{label}</Typography>
      {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
    </Paper>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={800} color="text.primary">{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" mt={0.25}>{subtitle}</Typography>}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: 4, bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
        justifyContent: 'center', mx: 'auto', mb: 2.5, fontSize: 32,
      }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700} mb={0.5} color="text.primary">{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" mb={3}>{subtitle}</Typography>}
      {action}
    </Box>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, confirmLabel = 'Delete', confirmColor = 'error' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2, flexShrink: 0,
          bgcolor: confirmColor === 'error' ? '#fef2f2' : 'primary.50',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ErrorOutlineIcon sx={{ color: confirmColor === 'error' ? 'error.main' : 'primary.main', fontSize: 20 }} />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" disabled={loading} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading} sx={{ flex: 1 }}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function PageLoader() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 2 }}>
      <CircularProgress size={32} thickness={3} />
      <Typography fontSize={13} color="text.secondary" fontWeight={500}>Loading...</Typography>
    </Box>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <Box onClick={() => !disabled && onChange(!checked)} sx={{
      width: 44, height: 24, borderRadius: 12,
      bgcolor: checked ? 'primary.main' : '#e2e8f0',
      position: 'relative', cursor: disabled ? 'default' : 'pointer',
      transition: 'background 0.2s', flexShrink: 0,
      boxShadow: checked ? '0 2px 8px rgba(14,165,233,0.3)' : 'none',
    }}>
      <Box sx={{
        position: 'absolute', top: 3,
        left: checked ? 22 : 3,
        width: 18, height: 18, borderRadius: '50%',
        bgcolor: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </Box>
  );
}
