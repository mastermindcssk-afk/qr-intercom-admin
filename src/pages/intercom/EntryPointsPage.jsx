import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Divider, Alert,
} from '@mui/material';
import AddRoundedIcon         from '@mui/icons-material/AddRounded';
import QrCode2RoundedIcon     from '@mui/icons-material/QrCode2Rounded';
import EditRoundedIcon        from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon      from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon     from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon    from '@mui/icons-material/DownloadRounded';
import LocationOnRoundedIcon  from '@mui/icons-material/LocationOnRounded';
import SignalWifiOffRoundedIcon from '@mui/icons-material/SignalWifiOffRounded';
import WifiRoundedIcon        from '@mui/icons-material/WifiRounded';
import { useSnackbar }        from 'notistack';
import { SectionHeader, StatusChip, ConfirmDialog, AvatarInitials, PageLoader, EmptyState } from '../../components/common';
import { getEntryPoints, createEntryPoint, updateEntryPoint, deleteEntryPoint, regenerateQRCode, getStaff } from '../../utils/api';

function QRModal({ entry, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [regen, setRegen] = useState(false);
  const qrUrl = `https://visit.nexkey.com/entry/${entry?.lockId}`;
  if (!entry) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode2RoundedIcon color="primary" sx={{ fontSize: 20 }} />
          </Box>
          QR Code — {entry.name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pt: 1 }}>
          {/* QR placeholder */}
          <Box sx={{
            width: 180, height: 180, borderRadius: 3,
            background: 'repeating-conic-gradient(#1e293b 0% 25%, #fff 0% 50%) 0 0/16px 16px',
            border: '6px solid #fff', boxShadow: '0 0 0 1.5px #e2e8f0, 0 8px 32px rgba(15,23,42,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(14,165,233,0.4)' }}>
              <QrCode2RoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
          </Box>

          {/* URL display */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Visitor URL
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Typography fontSize={12} color="text.secondary" flex={1} sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{qrUrl}</Typography>
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(qrUrl); enqueueSnackbar('URL copied!', { variant: 'success' }); }}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                <ContentCopyRoundedIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
          <Alert severity="info" sx={{ width: '100%', fontSize: 12, borderRadius: 2 }}>
            Tied to <strong>{entry.lockId}</strong>. Regenerating will invalidate all printed QR codes.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexWrap: 'wrap' }}>
        <Button
          startIcon={regen ? <CircularProgress size={13} /> : <RefreshRoundedIcon />}
          onClick={async () => { setRegen(true); await regenerateQRCode(entry.lockId).finally(() => setRegen(false)); enqueueSnackbar('QR regenerated', { variant: 'success' }); }}
          disabled={regen} color="warning" variant="outlined" size="small">
          Regenerate
        </Button>
        <Button startIcon={<DownloadRoundedIcon />} variant="contained" size="small">Download PNG</Button>
        <Button onClick={onClose} variant="outlined" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function EntryFormDialog({ open, editData, staff, onClose, onSave, saving }) {
  const [form, setForm] = useState({ name: '', lockId: '', location: '', alertRecipients: [] });
  useEffect(() => {
    if (open) setForm(editData
      ? { name: editData.name, lockId: editData.lockId, location: editData.location || '', alertRecipients: editData.alertRecipients || [] }
      : { name: '', lockId: '', location: '', alertRecipients: [] }
    );
  }, [open, editData]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{editData ? '✏️ Edit Entry Point' : '🚪 New Entry Point'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField fullWidth label="Entry Name" placeholder="e.g. Main Entrance" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <TextField fullWidth label="Lock ID" placeholder="e.g. LOCK_005" value={form.lockId}
          onChange={e => setForm(f => ({ ...f, lockId: e.target.value.toUpperCase() }))}
          required disabled={!!editData}
          helperText={editData ? 'Lock ID cannot be changed after creation' : 'Must match the Nexkey Controller LockID'} />
        <TextField fullWidth label="Location Description" placeholder="e.g. Front of Building A" value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        <FormControl fullWidth>
          <InputLabel>Alert Recipients</InputLabel>
          <Select multiple label="Alert Recipients" value={form.alertRecipients}
            onChange={e => setForm(f => ({ ...f, alertRecipients: e.target.value }))}
            renderValue={sel => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {sel.map(id => <Chip key={id} label={staff.find(x => x.id === id)?.name || id} size="small" />)}
              </Box>
            )}>
            {staff.filter(s => s.active).map(s => (
              <MenuItem key={s.id} value={s.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AvatarInitials name={s.name} size={28} fontSize={11} />
                  <Box>
                    <Typography fontSize={13} fontWeight={600}>{s.name}</Typography>
                    <Typography fontSize={11} color="text.secondary">{s.role}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained" sx={{ flex: 1 }}
          disabled={!form.name.trim() || !form.lockId.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editData ? 'Save Changes' : 'Create Entry Point'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EntryCard({ entry, staff, onEdit, onDelete, onViewQR }) {
  const recipients = staff.filter(s => entry.alertRecipients.includes(s.id));
  return (
    <Paper elevation={0} sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: entry.online ? 'divider' : '#fee2e2',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      '&:hover': { boxShadow: '0 8px 24px rgba(15,23,42,0.08)', transform: 'translateY(-1px)' },
    }}>
      {/* Status bar */}
      <Box sx={{ height: 4, bgcolor: entry.online ? '#10b981' : '#ef4444' }} />

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              {entry.online
                ? <WifiRoundedIcon sx={{ fontSize: 15, color: '#10b981', flexShrink: 0 }} />
                : <SignalWifiOffRoundedIcon sx={{ fontSize: 15, color: '#ef4444', flexShrink: 0 }} />
              }
              <Typography fontWeight={800} fontSize={15} noWrap color="text.primary">{entry.name}</Typography>
            </Box>
            {entry.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnRoundedIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                <Typography fontSize={12} color="text.secondary" noWrap>{entry.location}</Typography>
              </Box>
            )}
          </Box>
          <StatusChip status={entry.online ? 'online' : 'offline'} />
        </Box>

        <Divider />

        {/* Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography fontSize={11} color="text.secondary" fontWeight={700} sx={{ minWidth: 64, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lock ID</Typography>
            <Chip label={entry.lockId} size="small" variant="outlined"
              sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, borderRadius: 6 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography fontSize={11} color="text.secondary" fontWeight={700} sx={{ minWidth: 64, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sessions</Typography>
            <Typography fontSize={13} fontWeight={700} color="text.primary">{entry.sessions} this week</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Typography fontSize={11} color="text.secondary" fontWeight={700} sx={{ minWidth: 64, textTransform: 'uppercase', letterSpacing: '0.04em', mt: 0.25 }}>Alerts</Typography>
            {recipients.length > 0
              ? <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {recipients.map(s => (
                    <Tooltip key={s.id} title={`${s.name} (${s.role})`}>
                      <Chip label={s.name.split(' ')[0]} size="small" sx={{ fontSize: 11, height: 22, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />
                    </Tooltip>
                  ))}
                </Box>
              : <Typography fontSize={12} color="warning.main" fontWeight={600}>No recipients set</Typography>
            }
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1 }}>
          <Button variant="outlined" size="small" startIcon={<QrCode2RoundedIcon />}
            onClick={() => onViewQR(entry)} sx={{ flex: 1, fontSize: 12, py: 0.75 }}>
            View QR
          </Button>
          <IconButton size="small" onClick={() => onEdit(entry)}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: 'primary.50' } }}>
            <EditRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete(entry)}
            sx={{ border: '1px solid', borderColor: '#fecaca', bgcolor: '#fef2f2', borderRadius: 2, '&:hover': { bgcolor: '#fee2e2' } }}>
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default function EntryPointsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [entries, setEntries]           = useState([]);
  const [staff, setStaff]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [formOpen, setFormOpen]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [qrTarget, setQrTarget]         = useState(null);

  useEffect(() => {
    Promise.all([getEntryPoints(), getStaff()])
      .then(([e, s]) => { setEntries(e); setStaff(s); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editData) {
        await updateEntryPoint(editData.id, payload);
        setEntries(prev => prev.map(e => e.id === editData.id ? { ...e, ...payload } : e));
        enqueueSnackbar('Entry point updated', { variant: 'success' });
      } else {
        const created = await createEntryPoint(payload);
        setEntries(prev => [...prev, created]);
        enqueueSnackbar('Entry point created', { variant: 'success' });
      }
      setFormOpen(false); setEditData(null);
    } catch { enqueueSnackbar('Failed to save', { variant: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEntryPoint(deleteTarget.id);
      setEntries(prev => prev.filter(e => e.id !== deleteTarget.id));
      enqueueSnackbar(`"${deleteTarget.name}" deleted`, { variant: 'success' });
      setDeleteTarget(null);
    } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  const offlineCount = entries.filter(e => !e.online).length;

  return (
    <Box>
      <SectionHeader title="Entry Points"
        subtitle={`${entries.length} configured · ${entries.filter(e => e.online).length} online · ${offlineCount} offline`}
        action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditData(null); setFormOpen(true); }}>Add Entry Point</Button>}
      />
      {offlineCount > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #fecaca' }}>
          {offlineCount} entry point{offlineCount > 1 ? 's are' : ' is'} offline. Visitors cannot initiate sessions at these locations.
        </Alert>
      )}
      {entries.length === 0
        ? <EmptyState icon="🚪" title="No entry points yet" subtitle="Add your first entry point to generate a QR code for visitor check-in."
            action={<Button variant="contained" onClick={() => setFormOpen(true)}>Add Entry Point</Button>}
          />
        : <Grid container spacing={2.5}>
            {entries.map(e => (
              <Grid item xs={12} sm={6} lg={4} key={e.id}>
                <EntryCard entry={e} staff={staff}
                  onEdit={e => { setEditData(e); setFormOpen(true); }}
                  onDelete={setDeleteTarget}
                  onViewQR={setQrTarget}
                />
              </Grid>
            ))}
          </Grid>
      }
      <EntryFormDialog open={formOpen} editData={editData} staff={staff}
        onClose={() => { setFormOpen(false); setEditData(null); }} onSave={handleSave} saving={saving} />
      <QRModal entry={qrTarget} open={!!qrTarget} onClose={() => setQrTarget(null)} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Entry Point"
        message={`Delete "${deleteTarget?.name}" (${deleteTarget?.lockId})? The QR code will stop working. Visitor logs are preserved.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} confirmLabel="Delete" confirmColor="error" />
    </Box>
  );
}
