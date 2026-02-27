import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Divider, Alert,
} from '@mui/material';
import AddRoundedIcon       from '@mui/icons-material/AddRounded';
import EditRoundedIcon      from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon    from '@mui/icons-material/DeleteRounded';
import ScheduleRoundedIcon  from '@mui/icons-material/ScheduleRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import { useSnackbar } from 'notistack';
import { SectionHeader, ConfirmDialog, PageLoader, EmptyState } from '../../components/common';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getEntryPoints } from '../../utils/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AFTER_HOURS_OPTIONS = [
  { value: 'disable',  label: 'Disable QR code' },
  { value: 'security', label: 'Route to security' },
  { value: 'voicemail',label: 'Send to voicemail' },
];

function ScheduleFormDialog({ open, editData, entries, onClose, onSave, saving }) {
  const blank = { name: '', days: [1,2,3,4,5], startTime: '08:00', endTime: '18:00', afterHoursBehavior: 'disable', afterHoursMessage: '', assignedDoors: [] };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(editData ? { ...editData } : blank); }, [open, editData]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleDay = (d) => setForm(p => ({ ...p, days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d].sort() }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{editData ? '✏️ Edit Schedule' : '🗓️ New Schedule'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField fullWidth label="Schedule Name" placeholder="e.g. Business Hours" value={form.name} onChange={e => f('name', e.target.value)} required />
        {/* Day selector */}
        <Box>
          <Typography fontSize={12} fontWeight={700} color="text.secondary" mb={1} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Days</Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {DAYS.map((d, i) => (
              <Box key={d} onClick={() => toggleDay(i)} sx={{
                width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                ...(form.days.includes(i)
                  ? { bgcolor: 'primary.main', borderColor: 'primary.main', color: '#fff' }
                  : { bgcolor: 'background.paper', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main' } }
                ),
              }}>
                <Typography fontSize={12} fontWeight={700}>{d}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField fullWidth label="Start Time" type="time" InputLabelProps={{ shrink: true }} value={form.startTime} onChange={e => f('startTime', e.target.value)} />
          <TextField fullWidth label="End Time" type="time" InputLabelProps={{ shrink: true }} value={form.endTime} onChange={e => f('endTime', e.target.value)} />
        </Box>
        <FormControl fullWidth>
          <InputLabel>After-Hours Behavior</InputLabel>
          <Select label="After-Hours Behavior" value={form.afterHoursBehavior} onChange={e => f('afterHoursBehavior', e.target.value)}>
            {AFTER_HOURS_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField fullWidth label="After-Hours Message" multiline rows={2} value={form.afterHoursMessage}
          onChange={e => f('afterHoursMessage', e.target.value)}
          placeholder="Message shown to visitors when outside hours" />
        <FormControl fullWidth>
          <InputLabel>Assign to Doors</InputLabel>
          <Select multiple label="Assign to Doors" value={form.assignedDoors} onChange={e => f('assignedDoors', e.target.value)}
            renderValue={sel => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{sel.map(id => <Chip key={id} label={entries.find(x => x.id === id)?.name || id} size="small" />)}</Box>}>
            {entries.map(ep => <MenuItem key={ep.id} value={ep.id}><Typography fontSize={13} fontWeight={600}>{ep.name}</Typography><Typography fontSize={11} color="text.secondary" sx={{ ml: 1 }}>({ep.lockId})</Typography></MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained" disabled={!form.name.trim() || saving} sx={{ flex: 1 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editData ? 'Save Changes' : 'Create Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ScheduleCard({ schedule, entries, onEdit, onDelete }) {
  const assignedEntries = entries.filter(e => schedule.assignedDoors?.includes(e.id));
  const afterHoursLabel = AFTER_HOURS_OPTIONS.find(o => o.value === schedule.afterHoursBehavior)?.label || schedule.afterHoursBehavior;
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden',
      transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #10b981, #0ea5e9)' }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScheduleRoundedIcon sx={{ color: '#10b981', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} fontSize={14}>{schedule.name}</Typography>
              <Typography fontSize={12} color="text.secondary">{schedule.startTime} – {schedule.endTime}</Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Active days */}
        <Box sx={{ mb: 2 }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={1} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Days</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {DAYS.map((d, i) => (
              <Box key={d} sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                bgcolor: schedule.days.includes(i) ? '#f0fdf4' : '#f8fafc',
                color: schedule.days.includes(i) ? '#10b981' : '#cbd5e1',
                border: `1px solid ${schedule.days.includes(i) ? '#bbf7d0' : '#f1f5f9'}`,
              }}>{d}</Box>
            ))}
          </Box>
        </Box>
        {/* After hours */}
        <Box sx={{ mb: 2 }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>After Hours</Typography>
          <Chip label={afterHoursLabel} size="small" sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#fff8f0', color: '#d97706', border: '1px solid #fde68a' }} />
        </Box>
        {/* Assigned doors */}
        <Box sx={{ mb: 2 }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Assigned Doors ({assignedEntries.length})
          </Typography>
          {assignedEntries.length > 0
            ? <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {assignedEntries.map(ep => <Chip key={ep.id} label={ep.name} size="small" icon={<MeetingRoomRoundedIcon sx={{ fontSize: '12px !important' }} />}
                  sx={{ fontSize: 11, height: 22, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />)}
              </Box>
            : <Typography fontSize={12} color="text.secondary">No doors assigned</Typography>
          }
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit(schedule)} sx={{ flex: 1, fontSize: 12 }}>Edit</Button>
          <IconButton size="small" color="error" onClick={() => onDelete(schedule)} sx={{ border: '1px solid #fecaca', bgcolor: '#fef2f2', borderRadius: 2 }}>
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default function SchedulesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [schedules, setSchedules]       = useState([]);
  const [entries, setEntries]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [formOpen, setFormOpen]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    Promise.all([getSchedules(), getEntryPoints()])
      .then(([s, e]) => { setSchedules(s); setEntries(e); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editData) {
        await updateSchedule(editData.id, payload);
        setSchedules(prev => prev.map(s => s.id === editData.id ? { ...s, ...payload } : s));
        enqueueSnackbar('Schedule updated', { variant: 'success' });
      } else {
        const created = await createSchedule(payload);
        setSchedules(prev => [...prev, created]);
        enqueueSnackbar('Schedule created', { variant: 'success' });
      }
      setFormOpen(false); setEditData(null);
    } catch { enqueueSnackbar('Failed to save', { variant: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSchedule(deleteTarget.id);
      setSchedules(prev => prev.filter(s => s.id !== deleteTarget.id));
      enqueueSnackbar('Schedule deleted', { variant: 'success' });
      setDeleteTarget(null);
    } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <Box>
      <SectionHeader title="Schedules & Time Rules"
        subtitle="Control when doors and QR codes are active and how after-hours sessions are handled"
        action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditData(null); setFormOpen(true); }}>New Schedule</Button>}
      />
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, fontSize: 13 }}>
        Schedules define operating hours per door. After hours, you can disable QR, route to security, or send visitors to voicemail.
        Holiday overrides can be set per schedule.
      </Alert>
      {schedules.length === 0
        ? <EmptyState icon="🗓️" title="No schedules yet" subtitle="Create schedules to control door access hours."
            action={<Button variant="contained" onClick={() => setFormOpen(true)}>New Schedule</Button>} />
        : <Grid container spacing={2.5}>
            {schedules.map(s => (
              <Grid item xs={12} sm={6} md={4} key={s.id}>
                <ScheduleCard schedule={s} entries={entries}
                  onEdit={s => { setEditData(s); setFormOpen(true); }}
                  onDelete={setDeleteTarget}
                />
              </Grid>
            ))}
          </Grid>
      }
      <ScheduleFormDialog open={formOpen} editData={editData} entries={entries}
        onClose={() => { setFormOpen(false); setEditData(null); }} onSave={handleSave} saving={saving} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Schedule"
        message={`Delete "${deleteTarget?.name}"? Doors assigned to this schedule will have no time restrictions.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} confirmLabel="Delete" confirmColor="error" />
    </Box>
  );
}
