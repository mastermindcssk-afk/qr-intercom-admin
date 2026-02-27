import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Divider, Switch, Alert, FormControlLabel,
} from '@mui/material';
import AddRoundedIcon         from '@mui/icons-material/AddRounded';
import EditRoundedIcon        from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon      from '@mui/icons-material/DeleteRounded';
import CallSplitRoundedIcon   from '@mui/icons-material/CallSplitRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useSnackbar } from 'notistack';
import { SectionHeader, AvatarInitials, ConfirmDialog, PageLoader, EmptyState } from '../../components/common';
import { getRoutingRules, createRoutingRule, updateRoutingRule, deleteRoutingRule, getStaff, getEntryPoints } from '../../utils/api';

function RoutingFormDialog({ open, editData, staff, entries, onClose, onSave, saving }) {
  const blank = { name: '', primaryRecipients: [], fallbackRecipients: [], fallbackDelay: 30, autoDenyAfterRings: 5, voicemailOnMiss: true, entryPoints: [] };
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(editData ? { ...editData } : blank); }, [open, editData]);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>{editData ? '✏️ Edit Routing Rule' : '🔀 New Routing Rule'}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField fullWidth label="Rule Name" placeholder="e.g. Manager Route" value={form.name} onChange={e => f('name', e.target.value)} required />
        <FormControl fullWidth>
          <InputLabel>Primary Recipients</InputLabel>
          <Select multiple label="Primary Recipients" value={form.primaryRecipients} onChange={e => f('primaryRecipients', e.target.value)}
            renderValue={sel => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{sel.map(id => <Chip key={id} label={staff.find(x => x.id === id)?.name || id} size="small" />)}</Box>}>
            {staff.filter(s => s.active).map(s => <MenuItem key={s.id} value={s.id}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><AvatarInitials name={s.name} size={26} fontSize={10} /><Typography fontSize={13} fontWeight={600}>{s.name}</Typography><Typography fontSize={11} color="text.secondary">({s.role})</Typography></Box></MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Fallback Recipients</InputLabel>
          <Select multiple label="Fallback Recipients" value={form.fallbackRecipients} onChange={e => f('fallbackRecipients', e.target.value)}
            renderValue={sel => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{sel.map(id => <Chip key={id} label={staff.find(x => x.id === id)?.name || id} size="small" />)}</Box>}>
            {staff.filter(s => s.active).map(s => <MenuItem key={s.id} value={s.id}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><AvatarInitials name={s.name} size={26} fontSize={10} /><Typography fontSize={13} fontWeight={600}>{s.name}</Typography><Typography fontSize={11} color="text.secondary">({s.role})</Typography></Box></MenuItem>)}
          </Select>
        </FormControl>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="Fallback delay (sec)" type="number" value={form.fallbackDelay} onChange={e => f('fallbackDelay', parseInt(e.target.value))} inputProps={{ min: 5, max: 120 }} helperText="Seconds before ringing fallback" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Auto-deny after rings" type="number" value={form.autoDenyAfterRings} onChange={e => f('autoDenyAfterRings', parseInt(e.target.value))} inputProps={{ min: 1, max: 10 }} helperText="0 = never auto-deny" />
          </Grid>
        </Grid>
        <FormControl fullWidth>
          <InputLabel>Assign to Entry Points</InputLabel>
          <Select multiple label="Assign to Entry Points" value={form.entryPoints} onChange={e => f('entryPoints', e.target.value)}
            renderValue={sel => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{sel.map(id => <Chip key={id} label={entries.find(x => x.id === id)?.name || id} size="small" />)}</Box>}>
            {entries.map(ep => <MenuItem key={ep.id} value={ep.id}><Typography fontSize={13} fontWeight={600}>{ep.name}</Typography><Typography fontSize={11} color="text.secondary" sx={{ ml: 1 }}>({ep.lockId})</Typography></MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography fontSize={14} fontWeight={600}>Send to voicemail on miss</Typography>
            <Typography fontSize={12} color="text.secondary">Visitor can leave a voicemail if unanswered</Typography>
          </Box>
          <Switch checked={form.voicemailOnMiss} onChange={e => f('voicemailOnMiss', e.target.checked)} color="primary" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => onSave(form)} variant="contained" disabled={!form.name.trim() || saving} sx={{ flex: 1 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editData ? 'Save Changes' : 'Create Rule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RoutingCard({ rule, staff, entries, onEdit, onDelete, onToggle }) {
  const primary = staff.filter(s => rule.primaryRecipients.includes(s.id));
  const fallback = staff.filter(s => rule.fallbackRecipients.includes(s.id));
  const assignedEntries = entries.filter(e => rule.entryPoints.includes(e.id));
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: rule.active ? 'divider' : '#f1f5f9', overflow: 'hidden',
      opacity: rule.active ? 1 : 0.65, transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
      <Box sx={{ height: 3, bgcolor: rule.active ? 'linear-gradient(90deg, #0ea5e9, #6366f1)' : '#e2e8f0', background: rule.active ? 'linear-gradient(90deg, #0ea5e9, #6366f1)' : '#e2e8f0' }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CallSplitRoundedIcon sx={{ color: '#0ea5e9', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} fontSize={14}>{rule.name}</Typography>
              <Typography fontSize={12} color="text.secondary">{assignedEntries.length} door{assignedEntries.length !== 1 ? 's' : ''}</Typography>
            </Box>
          </Box>
          <Switch size="small" checked={rule.active} onChange={() => onToggle(rule.id)} color="primary" />
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Routing flow */}
        <Box sx={{ mb: 2 }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={1} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Routing Flow</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {primary.length > 0 ? primary.map(s => (
                <Tooltip key={s.id} title={s.name}><Box sx={{ width: 28, height: 28 }}><AvatarInitials name={s.name} size={28} fontSize={11} /></Box></Tooltip>
              )) : <Chip label="No recipients" size="small" color="warning" sx={{ fontSize: 10 }} />}
            </Box>
            {fallback.length > 0 && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: '#f1f5f9' }}>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography fontSize={10} color="text.secondary" fontWeight={600}>{rule.fallbackDelay}s</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {fallback.map(s => <Tooltip key={s.id} title={`Fallback: ${s.name}`}><Box sx={{ width: 28, height: 28, opacity: 0.7 }}><AvatarInitials name={s.name} size={28} fontSize={11} /></Box></Tooltip>)}
                </Box>
              </>
            )}
            {rule.voicemailOnMiss && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: '#f1f5f9' }}>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                </Box>
                <Chip label="📬 Voicemail" size="small" sx={{ fontSize: 10, height: 22, bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }} />
              </>
            )}
          </Box>
        </Box>
        {/* Config chips */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`Auto-deny: ${rule.autoDenyAfterRings} rings`} size="small" variant="outlined" sx={{ fontSize: 10, height: 22 }} />
          {rule.voicemailOnMiss && <Chip label="Voicemail on miss" size="small" sx={{ fontSize: 10, height: 22, bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }} />}
        </Box>
        {/* Assigned doors */}
        {assignedEntries.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {assignedEntries.map(ep => <Chip key={ep.id} label={ep.name} size="small" sx={{ fontSize: 10, height: 20, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />)}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit(rule)} sx={{ flex: 1, fontSize: 12 }}>Edit</Button>
          <IconButton size="small" color="error" onClick={() => onDelete(rule)} sx={{ border: '1px solid #fecaca', bgcolor: '#fef2f2', borderRadius: 2 }}>
            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

export default function RoutingRulesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [rules, setRules]               = useState([]);
  const [staff, setStaff]               = useState([]);
  const [entries, setEntries]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [formOpen, setFormOpen]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    Promise.all([getRoutingRules(), getStaff(), getEntryPoints()])
      .then(([r, s, e]) => { setRules(r); setStaff(s); setEntries(e); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editData) {
        await updateRoutingRule(editData.id, payload);
        setRules(prev => prev.map(r => r.id === editData.id ? { ...r, ...payload } : r));
        enqueueSnackbar('Routing rule updated', { variant: 'success' });
      } else {
        const created = await createRoutingRule(payload);
        setRules(prev => [...prev, created]);
        enqueueSnackbar('Routing rule created', { variant: 'success' });
      }
      setFormOpen(false); setEditData(null);
    } catch { enqueueSnackbar('Failed to save', { variant: 'error' }); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    const r = rules.find(x => x.id === id);
    setRules(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x));
    await updateRoutingRule(id, { active: !r.active });
    enqueueSnackbar(`Rule ${r.active ? 'disabled' : 'enabled'}`, { variant: 'success' });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRoutingRule(deleteTarget.id);
      setRules(prev => prev.filter(r => r.id !== deleteTarget.id));
      enqueueSnackbar('Rule deleted', { variant: 'success' });
      setDeleteTarget(null);
    } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <Box>
      <SectionHeader title="Routing Rules"
        subtitle="Define who gets notified and how calls are routed for each entry point"
        action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setEditData(null); setFormOpen(true); }}>New Rule</Button>}
      />
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, fontSize: 13 }}>
        <strong>How routing works:</strong> When a visitor rings, primary recipients are notified first. If no answer after the fallback delay, calls route to fallback recipients. If still unanswered, voicemail triggers (if enabled).
      </Alert>
      {rules.length === 0
        ? <EmptyState icon="🔀" title="No routing rules yet" subtitle="Create routing rules to define who responds to visitor calls."
            action={<Button variant="contained" onClick={() => setFormOpen(true)}>New Rule</Button>} />
        : <Grid container spacing={2.5}>
            {rules.map(r => (
              <Grid item xs={12} sm={6} md={4} key={r.id}>
                <RoutingCard rule={r} staff={staff} entries={entries}
                  onEdit={r => { setEditData(r); setFormOpen(true); }}
                  onDelete={setDeleteTarget}
                  onToggle={handleToggle}
                />
              </Grid>
            ))}
          </Grid>
      }
      <RoutingFormDialog open={formOpen} editData={editData} staff={staff} entries={entries}
        onClose={() => { setFormOpen(false); setEditData(null); }} onSave={handleSave} saving={saving} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Routing Rule"
        message={`Delete "${deleteTarget?.name}"? Entry points using this rule will have no routing configured.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} confirmLabel="Delete" confirmColor="error" />
    </Box>
  );
}
