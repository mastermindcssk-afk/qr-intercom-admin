import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Divider, Switch, Alert,
} from '@mui/material';
import AddRoundedIcon                   from '@mui/icons-material/AddRounded';
import EditRoundedIcon                  from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon                from '@mui/icons-material/DeleteRounded';
import PhoneRoundedIcon                 from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon                 from '@mui/icons-material/EmailRounded';
import NotificationsActiveRoundedIcon   from '@mui/icons-material/NotificationsActiveRounded';
import NotificationsOffRoundedIcon      from '@mui/icons-material/NotificationsOffRounded';
import LockOpenRoundedIcon              from '@mui/icons-material/LockOpenRounded';
import HistoryRoundedIcon               from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon              from '@mui/icons-material/SettingsRounded';
import { useSnackbar } from 'notistack';
import { SectionHeader, AvatarInitials, ConfirmDialog, PageLoader, EmptyState } from '../../components/common';
import { getStaff, createStaffMember, updateStaffMember, deleteStaffMember } from '../../utils/api';

const ROLES = ['Owner', 'Manager', 'Front Desk', 'Security', 'Admin', 'Staff', 'Other'];
const ROLE_COLORS = {
  'Owner':      { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' },
  'Manager':    { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  'Front Desk': { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Security':   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  'Admin':      { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
  'Staff':      { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  'Other':      { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

const PERM_LABELS = {
  receiveAlerts: { label: 'Receive Alerts', icon: <NotificationsActiveRoundedIcon sx={{ fontSize: 13 }} /> },
  unlockDoors:   { label: 'Unlock Doors',   icon: <LockOpenRoundedIcon sx={{ fontSize: 13 }} /> },
  viewLogs:      { label: 'View Logs',      icon: <HistoryRoundedIcon sx={{ fontSize: 13 }} /> },
  configureQR:   { label: 'Configure QR',   icon: <SettingsRoundedIcon sx={{ fontSize: 13 }} /> },
};

function StaffFormDialog({ open, editData, onClose, onSave, saving }) {
  const blank = { name: '', email: '', phone: '', role: 'Staff', active: true, permissions: { receiveAlerts: true, unlockDoors: false, viewLogs: true, configureQR: false } };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(editData ? { name: editData.name, email: editData.email, phone: editData.phone || '', role: editData.role, active: editData.active, permissions: { ...editData.permissions } } : blank); }, [open, editData]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const fp = (k, v) => setForm(p => ({ ...p, permissions: { ...p.permissions, [k]: v } }));
  const valid = form.name.trim() && form.email.includes('@');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{editData ? '✏️ Edit Member' : '👤 Add Staff Member'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField fullWidth label="Full Name" placeholder="Alex Johnson" value={form.name} onChange={e => f('name', e.target.value)} required />
        <TextField fullWidth label="Email" type="email" value={form.email} onChange={e => f('email', e.target.value)} required />
        <TextField fullWidth label="Phone (optional)" value={form.phone} onChange={e => f('phone', e.target.value)} />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={form.role} onChange={e => f('role', e.target.value)}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
        {/* Permissions */}
        <Box>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={1} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Permissions</Typography>
          <Box sx={{ borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {Object.entries(PERM_LABELS).map(([key, perm]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: '1px solid #f8fafc', '&:last-child': { borderBottom: 'none' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  {perm.icon}
                  <Typography fontSize={13} fontWeight={600} color="text.primary">{perm.label}</Typography>
                </Box>
                <Switch size="small" checked={form.permissions[key]} onChange={e => fp(key, e.target.checked)} color="primary" />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography fontSize={14} fontWeight={600}>Active Member</Typography>
            <Typography fontSize={12} color="text.secondary">Inactive staff won't receive alerts</Typography>
          </Box>
          <Switch checked={form.active} onChange={e => f('active', e.target.checked)} color="primary" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained" disabled={!valid || saving} sx={{ flex: 1 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editData ? 'Save Changes' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StaffCard({ member, onEdit, onDelete, onToggle }) {
  const roleStyle = ROLE_COLORS[member.role] || ROLE_COLORS['Other'];
  const perms = member.permissions || {};
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: member.active ? 'divider' : '#f1f5f9', overflow: 'hidden',
      opacity: member.active ? 1 : 0.7, transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
      <Box sx={{ height: 3, bgcolor: member.active ? roleStyle.color : '#e2e8f0' }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <AvatarInitials name={member.name} size={46} fontSize={17} sx={{ mt: 0.25 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
              <Typography fontWeight={800} fontSize={14} noWrap>{member.name}</Typography>
              <Switch size="small" checked={member.active} onChange={() => onToggle(member.id)} color="primary" />
            </Box>
            <Chip label={member.role} size="small" sx={{ fontSize: 11, fontWeight: 700, height: 20, bgcolor: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`, borderRadius: 6 }} />
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Contact */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EmailRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
            </Box>
            <Typography fontSize={12} color="text.secondary" noWrap>{member.email}</Typography>
          </Box>
          {member.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PhoneRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
              </Box>
              <Typography fontSize={12} color="text.secondary">{member.phone}</Typography>
            </Box>
          )}
        </Box>
        {/* Permissions */}
        <Box sx={{ mb: 2 }}>
          <Typography fontSize={10} fontWeight={700} color="text.secondary" mb={1} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Permissions</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {Object.entries(PERM_LABELS).map(([key, perm]) => (
              <Chip key={key} size="small" label={perm.label}
                sx={{ fontSize: 10, height: 20,
                  ...(perms[key]
                    ? { bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                    : { bgcolor: '#f8fafc', color: '#cbd5e1', border: '1px solid #f1f5f9', textDecoration: 'line-through' }
                  ),
                }} />
            ))}
          </Box>
        </Box>
        {/* Alert status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: member.active ? '#f0fdf4' : '#f8fafc', border: '1px solid', borderColor: member.active ? '#bbf7d0' : '#f1f5f9' }}>
          {member.active ? <NotificationsActiveRoundedIcon sx={{ fontSize: 14, color: '#10b981' }} /> : <NotificationsOffRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
          <Typography fontSize={12} fontWeight={600} color={member.active ? 'success.main' : 'text.disabled'}>
            {member.active ? 'Receiving alerts' : 'Alerts paused'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit(member)} sx={{ flex: 1, fontSize: 12 }}>Edit</Button>
          <IconButton size="small" color="error" onClick={() => onDelete(member)} sx={{ border: '1px solid #fecaca', bgcolor: '#fef2f2', borderRadius: 2 }}>
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default function StaffPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [staff, setStaff]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [formOpen, setFormOpen]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { getStaff().then(setStaff).finally(() => setLoading(false)); }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editData) {
        await updateStaffMember(editData.id, payload);
        setStaff(prev => prev.map(s => s.id === editData.id ? { ...s, ...payload } : s));
        enqueueSnackbar('Member updated', { variant: 'success' });
      } else {
        const created = await createStaffMember(payload);
        setStaff(prev => [...prev, created]);
        enqueueSnackbar('Member added', { variant: 'success' });
      }
      setFormOpen(false); setEditData(null);
    } catch { enqueueSnackbar('Failed to save', { variant: 'error' }); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    const m = staff.find(s => s.id === id);
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    await updateStaffMember(id, { active: !m.active });
    enqueueSnackbar(`${m.name} ${m.active ? 'deactivated' : 'activated'}`, { variant: 'success' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStaffMember(deleteTarget.id);
      setStaff(prev => prev.filter(s => s.id !== deleteTarget.id));
      enqueueSnackbar(`${deleteTarget.name} removed`, { variant: 'success' });
      setDeleteTarget(null);
    } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;
  const active = staff.filter(s => s.active).length;

  return (
    <Box>
      <SectionHeader title="Staff & Roles"
        subtitle={`${active} active · ${staff.filter(s => !s.active).length} inactive — Manage permissions and alert recipients`}
        action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditData(null); setFormOpen(true); }}>Add Member</Button>}
      />
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, fontSize: 13 }}>
        <strong>Principle of least privilege:</strong> Only grant the permissions each staff member needs. Changes to permissions take effect immediately.
      </Alert>
      {staff.length === 0
        ? <EmptyState icon="👥" title="No staff members" subtitle="Add staff who should receive intercom alerts." action={<Button variant="contained" onClick={() => setFormOpen(true)}>Add Member</Button>} />
        : <Grid container spacing={2.5}>
            {staff.map(m => (
              <Grid item xs={12} sm={6} md={4} key={m.id}>
                <StaffCard member={m} onEdit={m => { setEditData(m); setFormOpen(true); }} onDelete={setDeleteTarget} onToggle={handleToggle} />
              </Grid>
            ))}
          </Grid>
      }
      <StaffFormDialog open={formOpen} editData={editData} onClose={() => { setFormOpen(false); setEditData(null); }} onSave={handleSave} saving={saving} />
      <ConfirmDialog open={!!deleteTarget} title="Remove Staff Member"
        message={`Remove "${deleteTarget?.name}"? They'll stop receiving alerts and lose all access. Logs are preserved.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} confirmLabel="Remove" confirmColor="error" />
    </Box>
  );
}
