import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Chip,
  InputAdornment, IconButton, Tooltip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import SearchRoundedIcon        from '@mui/icons-material/SearchRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import EditRoundedIcon          from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon        from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon           from '@mui/icons-material/AddRounded';
import { useSnackbar }          from 'notistack';
import { SectionHeader, EmptyState, ConfirmDialog, Toggle, PageLoader } from '../../components/common';
import { getVisitReasons, createVisitReason, updateVisitReason, deleteVisitReason, reorderVisitReasons } from '../../utils/api';
import { EMOJI_OPTIONS } from '../../mock/data';

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Tooltip title="Choose icon">
        <Button variant="outlined" onClick={() => setOpen(o => !o)}
          sx={{ minWidth: 56, height: 52, fontSize: 24, p: 0, borderRadius: 2, borderColor: '#e2e8f0', '&:hover': { borderColor: '#0ea5e9', bgcolor: '#f0f9ff' } }}>
          {value}
        </Button>
      </Tooltip>
      {open && (
        <Paper elevation={8} sx={{
          position: 'absolute', top: '110%', left: 0, zIndex: 9999,
          p: 1.5, borderRadius: 2.5, boxShadow: '0 16px 48px rgba(15,23,42,0.15)',
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5,
          minWidth: 280, border: '1px solid #e2e8f0',
        }}>
          {EMOJI_OPTIONS.map(e => (
            <IconButton key={e} size="small" onClick={() => { onChange(e); setOpen(false); }}
              sx={{ fontSize: 18, width: 32, height: 32, borderRadius: 1.5,
                bgcolor: value === e ? '#f0f9ff' : 'transparent',
                border: value === e ? '1px solid #bae6fd' : '1px solid transparent',
                '&:hover': { bgcolor: '#f0f9ff' },
              }}>
              {e}
            </IconButton>
          ))}
        </Paper>
      )}
    </Box>
  );
}

function ReasonFormDialog({ open, editData, onClose, onSave, saving }) {
  const [label, setLabel] = useState('');
  const [icon, setIcon]   = useState('🎯');
  useEffect(() => {
    if (open) { setLabel(editData?.label || ''); setIcon(editData?.icon || '🎯'); }
  }, [open, editData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>
        {editData ? '✏️ Edit Visit Reason' : '✨ New Visit Reason'}
      </DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.75} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Icon</Typography>
              <EmojiPicker value={icon} onChange={setIcon} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" mb={0.75} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Label</Typography>
              <TextField autoFocus fullWidth value={label}
                onChange={e => setLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && label.trim() && onSave({ label: label.trim(), icon })}
                placeholder="e.g. Security Check"
                inputProps={{ maxLength: 40 }}
                helperText={`${label.length}/40 characters`}
              />
            </Box>
          </Box>
          <Alert severity="info" sx={{ fontSize: 12, borderRadius: 2 }}>
            This reason will appear as a button on the visitor check-in screen.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={() => onSave({ label: label.trim(), icon })} variant="contained" sx={{ flex: 1 }}
          disabled={!label.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editData ? 'Save Changes' : 'Add Reason'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReasonRow({ reason, index, onEdit, onDelete, onToggle, onDragStart, onDragOver, onDrop }) {
  return (
    <Paper elevation={0} draggable
      onDragStart={() => onDragStart(reason.id)}
      onDragOver={e => { e.preventDefault(); onDragOver(reason.id); }}
      onDrop={() => onDrop(reason.id)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.75,
        border: '1px solid', borderColor: reason.active ? 'divider' : '#f1f5f9',
        borderRadius: 2.5,
        cursor: 'grab',
        opacity: reason.active ? 1 : 0.6,
        bgcolor: reason.active ? 'background.paper' : '#f8fafc',
        transition: 'all 0.15s ease',
        '&:hover': { boxShadow: '0 4px 16px rgba(15,23,42,0.08)', borderColor: '#cbd5e1', transform: 'translateY(-1px)' },
        '&:active': { cursor: 'grabbing' },
      }}>
      <DragIndicatorRoundedIcon sx={{ color: '#cbd5e1', fontSize: 20, flexShrink: 0, '&:hover': { color: 'text.secondary' } }} />
      <Box sx={{
        width: 26, height: 26, borderRadius: '50%',
        bgcolor: '#f1f5f9', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Typography fontSize={10} fontWeight={800} color="text.secondary">{index + 1}</Typography>
      </Box>

      <Box sx={{
        width: 40, height: 40, borderRadius: 2, bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20,
      }}>
        {reason.icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontSize={14} fontWeight={700} noWrap color="text.primary">{reason.label}</Typography>
          {reason.isDefault && (
            <Chip label="Default" size="small"
              sx={{ fontSize: 10, height: 18, fontWeight: 700, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: 5 }} />
          )}
        </Box>
        <Typography fontSize={12} color="text.secondary">{reason.usageCount.toLocaleString()} uses total</Typography>
      </Box>

      <Tooltip title={reason.active ? 'Disable for visitors' : 'Enable for visitors'}>
        <Box><Toggle checked={reason.active} onChange={() => onToggle(reason.id)} /></Box>
      </Tooltip>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => onEdit(reason)}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.100' } }}>
          <EditRoundedIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
      {!reason.isDefault ? (
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(reason)}
            sx={{ border: '1px solid', borderColor: '#fecaca', bgcolor: '#fef2f2', borderRadius: 1.5, '&:hover': { bgcolor: '#fee2e2' } }}>
            <DeleteRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      ) : <Box sx={{ width: 34 }} />}
    </Paper>
  );
}

export default function VisitReasonsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [reasons,      setReasons]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [formOpen,     setFormOpen]     = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const dragFrom = useRef(null);

  useEffect(() => {
    getVisitReasons()
      .then(d => setReasons(d.sort((a, b) => a.order - b.order)))
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = (id) => { dragFrom.current = id; };
  const handleDrop = (targetId) => {
    const fromId = dragFrom.current;
    if (!fromId || fromId === targetId) return;
    setReasons(prev => {
      const arr = [...prev];
      const fi  = arr.findIndex(r => r.id === fromId);
      const ti  = arr.findIndex(r => r.id === targetId);
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      const reordered = arr.map((r, i) => ({ ...r, order: i }));
      reorderVisitReasons(reordered.map(r => r.id));
      return reordered;
    });
    dragFrom.current = null;
  };

  const handleToggle = async (id) => {
    const r = reasons.find(x => x.id === id);
    setReasons(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x));
    try {
      await updateVisitReason(id, { active: !r.active });
      enqueueSnackbar(`"${r.label}" ${r.active ? 'disabled' : 'enabled'}`, { variant: 'success' });
    } catch {
      setReasons(prev => prev.map(x => x.id === id ? { ...x, active: r.active } : x));
      enqueueSnackbar('Failed to update', { variant: 'error' });
    }
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editData) {
        await updateVisitReason(editData.id, payload);
        setReasons(prev => prev.map(r => r.id === editData.id ? { ...r, ...payload } : r));
        enqueueSnackbar('Visit reason updated', { variant: 'success' });
      } else {
        const created = await createVisitReason({ ...payload, order: reasons.length, active: true, isDefault: false });
        setReasons(prev => [...prev, created]);
        enqueueSnackbar('Visit reason added', { variant: 'success' });
      }
      setFormOpen(false); setEditData(null);
    } catch { enqueueSnackbar('Failed to save', { variant: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVisitReason(deleteTarget.id);
      setReasons(prev => prev.filter(r => r.id !== deleteTarget.id));
      enqueueSnackbar(`"${deleteTarget.label}" deleted`, { variant: 'success' });
      setDeleteTarget(null);
    } catch { enqueueSnackbar('Failed to delete', { variant: 'error' }); }
    finally { setDeleting(false); }
  };

  const filtered = reasons.filter(r => r.label.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ maxWidth: 780 }}>
      <SectionHeader
        title="Visit Reasons"
        subtitle="Visitors see these buttons on the check-in screen. Drag to reorder."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => { setEditData(null); setFormOpen(true); }}>
            Add Reason
          </Button>
        }
      />

      {/* Stats chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        <Chip size="small" label={`${reasons.length} total`} variant="outlined" sx={{ fontWeight: 600 }} />
        <Chip size="small" label={`${reasons.filter(r => r.active).length} active`}
          sx={{ fontWeight: 600, bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }} />
        <Chip size="small" label={`${reasons.filter(r => !r.active).length} disabled`}
          sx={{ fontWeight: 600, bgcolor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }} />
        <Chip size="small" label={`${reasons.filter(r => !r.isDefault).length} custom`}
          sx={{ fontWeight: 600, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />
      </Box>

      <TextField fullWidth size="small" placeholder="Search reasons…" value={search}
        onChange={e => setSearch(e.target.value)} sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {filtered.length === 0
          ? <EmptyState icon="🔍" title="No reasons found" subtitle="Try adjusting your search." />
          : filtered.map((r, i) => (
            <ReasonRow key={r.id} reason={r} index={i}
              onEdit={r => { setEditData(r); setFormOpen(true); }}
              onDelete={setDeleteTarget}
              onToggle={handleToggle}
              onDragStart={handleDragStart}
              onDragOver={() => {}}
              onDrop={handleDrop}
            />
          ))
        }
      </Box>

      <Paper elevation={0} sx={{ mt: 3, p: 2.5, bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2.5 }}>
        <Typography variant="body2" color="#92400e" lineHeight={1.6}>
          💡 <strong>Default reasons</strong> cannot be deleted but can be disabled.
          Custom reasons appear in the order shown above. Changes take effect immediately on the check-in screen.
        </Typography>
      </Paper>

      <ReasonFormDialog open={formOpen} editData={editData}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSave={handleSave} saving={saving} />

      <ConfirmDialog open={!!deleteTarget} title="Delete Visit Reason"
        message={`Delete "${deleteTarget?.label}"? This cannot be undone. Historical logs will still reference this reason.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
        loading={deleting} confirmLabel="Delete" confirmColor="error" />
    </Box>
  );
}
