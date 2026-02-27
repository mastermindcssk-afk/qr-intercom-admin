import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Divider, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import AddRoundedIcon           from '@mui/icons-material/AddRounded';
import QrCode2RoundedIcon       from '@mui/icons-material/QrCode2Rounded';
import RefreshRoundedIcon       from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon   from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon      from '@mui/icons-material/DownloadRounded';
import BlockRoundedIcon         from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon   from '@mui/icons-material/CheckCircleRounded';
import PrintRoundedIcon         from '@mui/icons-material/PrintRounded';
import WifiRoundedIcon          from '@mui/icons-material/WifiRounded';
import SignalWifiOffRoundedIcon  from '@mui/icons-material/SignalWifiOffRounded';
import AccessTimeRoundedIcon    from '@mui/icons-material/AccessTimeRounded';
import { useSnackbar } from 'notistack';
import { SectionHeader, StatusChip, PageLoader, EmptyState, ConfirmDialog } from '../../components/common';
import { getEntryPoints, regenerateQRCode, revokeQRCode, updateEntryPoint } from '../../utils/api';
import { formatTime } from '../../utils/helpers';

function QRCodePreview({ entry }) {
  return (
    <Box sx={{
      width: 160, height: 160, borderRadius: 3,
      background: 'repeating-conic-gradient(#1e293b 0% 25%, #fff 0% 50%) 0 0/14px 14px',
      border: '6px solid #fff', boxShadow: '0 0 0 1.5px #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <QrCode2RoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
      </Box>
      {entry.qrStatus === 'disabled' && (
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <BlockRoundedIcon sx={{ color: '#ef4444', fontSize: 32 }} />
          <Typography fontSize={11} fontWeight={800} color="error.main">DISABLED</Typography>
        </Box>
      )}
    </Box>
  );
}

function QRDetailModal({ entry, open, onClose, onRegenerate, onRevoke }) {
  const { enqueueSnackbar } = useSnackbar();
  const [regening, setRegening] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const qrUrl = `https://visit.nexkey.com/entry/${entry?.lockId}`;
  if (!entry) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, pt: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode2RoundedIcon color="primary" sx={{ fontSize: 20 }} />
        </Box>
        QR Code — {entry.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1 }}>
            <QRCodePreview entry={entry} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} sx={{ fontSize: 11 }}>PNG</Button>
              <Button size="small" variant="outlined" startIcon={<PrintRoundedIcon />} sx={{ fontSize: 11 }}>Print</Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</Typography>
              <Chip label={entry.qrStatus === 'active' ? 'Active' : 'Disabled'} size="small"
                sx={{ fontWeight: 700, bgcolor: entry.qrStatus === 'active' ? '#f0fdf4' : '#fef2f2', color: entry.qrStatus === 'active' ? '#15803d' : '#dc2626', border: `1px solid ${entry.qrStatus === 'active' ? '#bbf7d0' : '#fecaca'}` }} />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lock ID</Typography>
              <Chip label={entry.lockId} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Visitor URL</Typography>
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc' }}>
                <Typography fontSize={11} color="text.secondary" flex={1} sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>{qrUrl}</Typography>
                <IconButton size="small" onClick={() => { navigator.clipboard.writeText(qrUrl); enqueueSnackbar('Copied!', { variant: 'success' }); }}>
                  <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Paper>
            </Box>
            {entry.qrGenerated && (
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Generated</Typography>
                <Typography fontSize={12} color="text.secondary">{formatTime(entry.qrGenerated)}</Typography>
              </Box>
            )}
            {entry.lastScanned && (
              <Box>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Scanned</Typography>
                <Typography fontSize={12} color="text.secondary">{formatTime(entry.lastScanned)}</Typography>
              </Box>
            )}
            <Alert severity="warning" sx={{ fontSize: 11, borderRadius: 2 }}>
              Regenerating invalidates all printed QR codes for this door.
            </Alert>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexWrap: 'wrap' }}>
        <Button startIcon={regening ? <CircularProgress size={13} /> : <RefreshRoundedIcon />}
          onClick={async () => { setRegening(true); await regenerateQRCode(entry.lockId).finally(() => setRegening(false)); onRegenerate(entry.id); enqueueSnackbar('QR code regenerated', { variant: 'success' }); }}
          disabled={regening || revoking} color="warning" variant="outlined" size="small">Regenerate</Button>
        <Button startIcon={revoking ? <CircularProgress size={13} /> : <BlockRoundedIcon />}
          onClick={async () => { setRevoking(true); await revokeQRCode(entry.lockId).finally(() => setRevoking(false)); onRevoke(entry.id); enqueueSnackbar('QR code revoked', { variant: 'warning' }); onClose(); }}
          disabled={regening || revoking || entry.qrStatus === 'disabled'} color="error" variant="outlined" size="small">Revoke</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} variant="contained" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function QRCodesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { getEntryPoints().then(setEntries).finally(() => setLoading(false)); }, []);

  const handleRegenerate = (id) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, qrGenerated: new Date().toISOString() } : e));
  };
  const handleRevoke = (id) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, qrStatus: 'disabled' } : e));
  };
  const handleReactivate = async (entry) => {
    await updateEntryPoint(entry.id, { qrStatus: 'active' });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, qrStatus: 'active' } : e));
    enqueueSnackbar(`${entry.name} QR re-activated`, { variant: 'success' });
  };

  if (loading) return <PageLoader />;

  const active = entries.filter(e => e.qrStatus === 'active').length;
  const disabled = entries.filter(e => e.qrStatus === 'disabled').length;

  return (
    <Box>
      <SectionHeader title="QR Code Management"
        subtitle={`${active} active · ${disabled} disabled · Manage QR codes for all entry points`}
      />

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total QR Codes', value: entries.length, icon: '🔲', color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'Active',         value: active,          icon: '✅', color: '#10b981', bg: '#f0fdf4' },
          { label: 'Disabled',       value: disabled,        icon: '🚫', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Online Doors',   value: entries.filter(e => e.online).length, icon: '📡', color: '#6366f1', bg: '#faf5ff' },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, alignItems: 'center',
              '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.07)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: s.bg, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
              <Box>
                <Typography variant="h5" fontWeight={800} lineHeight={1} color="text.primary">{s.value}</Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.25}>{s.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* QR Code table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
          <Typography fontWeight={800} fontSize={15}>All QR Codes</Typography>
          <Typography fontSize={12} color="text.secondary">Click any row to manage the QR code</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                {['QR Code', 'Location', 'Lock ID', 'Status', 'Door Status', 'Last Scanned', 'Auto-Unlock', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(entry => (
                <TableRow key={entry.id} hover sx={{ cursor: 'pointer', '& td': { fontSize: 13, borderBottom: '1px solid #f1f5f9' } }}
                  onClick={() => setSelected(entry)}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 1.5,
                        background: entry.qrStatus === 'active'
                          ? 'repeating-conic-gradient(#1e293b 0% 25%, #fff 0% 50%) 0 0/8px 8px'
                          : '#f1f5f9',
                        border: '2px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {entry.qrStatus === 'disabled'
                          ? <BlockRoundedIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                          : <QrCode2RoundedIcon sx={{ fontSize: 16, color: '#0ea5e9' }} />
                        }
                      </Box>
                      <Box>
                        <Typography fontWeight={700} fontSize={13}>{entry.name}</Typography>
                        <Typography fontSize={11} color="text.secondary">{entry.location}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{entry.location}</TableCell>
                  <TableCell><Chip label={entry.lockId} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11 }} /></TableCell>
                  <TableCell>
                    <Chip label={entry.qrStatus === 'active' ? 'Active' : 'Disabled'} size="small"
                      sx={{ fontWeight: 700, fontSize: 11, height: 22, bgcolor: entry.qrStatus === 'active' ? '#f0fdf4' : '#fef2f2', color: entry.qrStatus === 'active' ? '#15803d' : '#dc2626', border: `1px solid ${entry.qrStatus === 'active' ? '#bbf7d0' : '#fecaca'}` }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {entry.online ? <WifiRoundedIcon sx={{ fontSize: 15, color: '#10b981' }} /> : <SignalWifiOffRoundedIcon sx={{ fontSize: 15, color: '#94a3b8' }} />}
                      <Typography fontSize={12} color={entry.online ? 'success.main' : 'text.secondary'} fontWeight={600}>{entry.online ? 'Online' : 'Offline'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      {entry.lastScanned ? formatTime(entry.lastScanned).split(',')[0] : '—'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={entry.autoUnlock ? 'Enabled' : 'Disabled'} size="small"
                      sx={{ fontWeight: 600, fontSize: 10, height: 20, bgcolor: entry.autoUnlock ? '#fffbeb' : '#f8fafc', color: entry.autoUnlock ? '#d97706' : '#94a3b8' }} />
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View QR Code">
                        <IconButton size="small" onClick={() => setSelected(entry)} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                          <QrCode2RoundedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      {entry.qrStatus === 'disabled' && (
                        <Tooltip title="Re-activate QR">
                          <IconButton size="small" color="success" onClick={() => handleReactivate(entry)} sx={{ border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', borderRadius: 1.5 }}>
                            <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selected && (
        <QRDetailModal entry={selected} open={!!selected} onClose={() => setSelected(null)}
          onRegenerate={handleRegenerate} onRevoke={handleRevoke} />
      )}
    </Box>
  );
}
