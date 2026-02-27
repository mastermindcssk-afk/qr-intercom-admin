import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress,
} from '@mui/material';
import AddRoundedIcon        from '@mui/icons-material/AddRounded';
import EditRoundedIcon       from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon     from '@mui/icons-material/DeleteRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PeopleRoundedIcon     from '@mui/icons-material/PeopleRounded';
import QrCode2RoundedIcon    from '@mui/icons-material/QrCode2Rounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useSnackbar } from 'notistack';
import { SectionHeader, ConfirmDialog, PageLoader, EmptyState } from '../../components/common';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../../utils/api';

function LocationFormDialog({ open, editData, onClose, onSave, saving }) {
  const blank = { name: '', address: '' };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(editData ? { name: editData.name, address: editData.address } : blank); }, [open, editData]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{editData ? '✏️ Edit Location' : '📍 New Location'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField fullWidth label="Location Name" placeholder="e.g. Building A – HQ" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <TextField fullWidth label="Address" placeholder="100 Main St, San Francisco, CA" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} multiline rows={2} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained" disabled={!form.name.trim() || saving} sx={{ flex: 1 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editData ? 'Save Changes' : 'Add Location'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LocationCard({ location, onEdit, onDelete, onCopy }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden',
      transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #0ea5e9)' }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocationOnRoundedIcon sx={{ color: '#6366f1', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} fontSize={14}>{location.name}</Typography>
              <Typography fontSize={11} color="text.secondary">{location.address}</Typography>
            </Box>
          </Box>
        </Box>
        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <MeetingRoomRoundedIcon sx={{ fontSize: 14, color: '#0ea5e9' }} />
              <Typography fontWeight={800} fontSize={18} color="primary.main">{location.doors}</Typography>
            </Box>
            <Typography fontSize={11} color="text.secondary">Doors</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <PeopleRoundedIcon sx={{ fontSize: 14, color: '#6366f1' }} />
              <Typography fontWeight={800} fontSize={18} color="secondary.main">{location.staff}</Typography>
            </Box>
            <Typography fontSize={11} color="text.secondary">Staff</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <QrCode2RoundedIcon sx={{ fontSize: 14, color: '#10b981' }} />
              <Typography fontWeight={800} fontSize={18} color="success.main">{location.totalScans}</Typography>
            </Box>
            <Typography fontSize={11} color="text.secondary">Scans</Typography>
          </Box>
        </Box>
        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit(location)} sx={{ flex: 1, fontSize: 12 }}>Edit</Button>
          <Button size="small" variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={() => onCopy(location)} sx={{ fontSize: 12 }}>Copy Config</Button>
          <IconButton size="small" color="error" onClick={() => onDelete(location)} sx={{ border: '1px solid #fecaca', bgcolor: '#fef2f2', borderRadius: 2 }}>
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default function LocationsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [locations, setLocations]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [formOpen, setFormOpen]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { getLocations().then(setLocations).finally(() => setLoading(false)); }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editData) {
        await updateLocation(editData.id, payload);
        setLocations(prev => prev.map(l => l.id === editData.id ? { ...l, ...payload } : l));
        enqueueSnackbar('Location updated', { variant: 'success' });
      } else {
        const created = await createLocation(payload);
        setLocations(prev => [...prev, created]);
        enqueueSnackbar('Location added', { variant: 'success' });
      }
      setFormOpen(false); setEditData(null);
    } catch { enqueueSnackbar('Failed to save', { variant: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLocation(deleteTarget.id);
      setLocations(prev => prev.filter(l => l.id !== deleteTarget.id));
      enqueueSnackbar('Location removed', { variant: 'success' });
      setDeleteTarget(null);
    } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <Box>
      <SectionHeader title="Locations"
        subtitle={`${locations.length} location${locations.length !== 1 ? 's' : ''} · Manage multi-site deployments`}
        action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditData(null); setFormOpen(true); }}>Add Location</Button>}
      />
      {locations.length === 0
        ? <EmptyState icon="📍" title="No locations yet" subtitle="Add locations to manage multiple sites from a single dashboard."
            action={<Button variant="contained" onClick={() => setFormOpen(true)}>Add Location</Button>} />
        : <Grid container spacing={2.5}>
            {locations.map(l => (
              <Grid item xs={12} sm={6} md={4} key={l.id}>
                <LocationCard location={l}
                  onEdit={l => { setEditData(l); setFormOpen(true); }}
                  onDelete={setDeleteTarget}
                  onCopy={() => enqueueSnackbar('Configuration copied to clipboard', { variant: 'success' })}
                />
              </Grid>
            ))}
          </Grid>
      }
      <LocationFormDialog open={formOpen} editData={editData}
        onClose={() => { setFormOpen(false); setEditData(null); }} onSave={handleSave} saving={saving} />
      <ConfirmDialog open={!!deleteTarget} title="Remove Location"
        message={`Remove "${deleteTarget?.name}"? All associated doors and configurations will need to be reassigned.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} confirmLabel="Remove" confirmColor="error" />
    </Box>
  );
}
