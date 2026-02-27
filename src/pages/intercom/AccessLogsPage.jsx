import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Chip,
  InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Tooltip, IconButton, Collapse, Divider,
} from '@mui/material';
import SearchRoundedIcon       from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import FilterListRoundedIcon   from '@mui/icons-material/FilterListRounded';
import ExpandMoreRoundedIcon   from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon   from '@mui/icons-material/ExpandLessRounded';
import PhotoCameraRoundedIcon  from '@mui/icons-material/PhotoCameraRounded';
import CloseRoundedIcon        from '@mui/icons-material/CloseRounded';
import { useSnackbar }         from 'notistack';
import { SectionHeader, StatusChip, AvatarInitials, PageLoader, EmptyState } from '../../components/common';
import { getAccessLogs, getEntryPoints } from '../../utils/api';
import { formatTime, timeAgo, downloadCSV } from '../../utils/helpers';

const STATUS_FILTERS = [
  { value: 'all',       label: 'All',       bg: 'transparent', color: 'text.secondary' },
  { value: 'granted',   label: 'Granted',   bg: '#f0fdf4',     color: '#15803d' },
  { value: 'denied',    label: 'Denied',    bg: '#fef2f2',     color: '#dc2626' },
  { value: 'voicemail', label: 'Voicemail', bg: '#fffbeb',     color: '#d97706' },
];

export default function AccessLogsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [logs, setLogs]               = useState([]);
  const [entries, setEntries]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [entryFilter, setEntry]       = useState('all');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRPP]         = useState(25);
  const [expanded, setExpanded]       = useState(null);

  useEffect(() => {
    Promise.all([getAccessLogs(), getEntryPoints()])
      .then(([l, e]) => { setLogs(l); setEntries(e); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => logs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (entryFilter  !== 'all' && log.entry  !== entryFilter)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!log.visitor.toLowerCase().includes(q) &&
          !log.reason.toLowerCase().includes(q) &&
          !log.entry.toLowerCase().includes(q) &&
          !(log.staffName || '').toLowerCase().includes(q)) return false;
    }
    if (dateFrom && new Date(log.time) < new Date(dateFrom)) return false;
    if (dateTo   && new Date(log.time) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  }), [logs, statusFilter, entryFilter, search, dateFrom, dateTo]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const hasActive = search || statusFilter !== 'all' || entryFilter !== 'all' || dateFrom || dateTo;

  const clearFilters = () => { setSearch(''); setStatus('all'); setEntry('all'); setDateFrom(''); setDateTo(''); setPage(0); };

  const handleExport = () => {
    try {
      downloadCSV(filtered.map(l => ({
        visitor: l.visitor, reason: l.reason, entry: l.entry,
        time: formatTime(l.time), status: l.status,
        staff: l.staffName || 'N/A', duration: l.duration,
        snapshot: l.hasSnapshot ? 'Yes' : 'No',
      })), 'access-logs.csv');
      enqueueSnackbar('Exported successfully', { variant: 'success' });
    } catch { enqueueSnackbar('Export failed', { variant: 'error' }); }
  };

  if (loading) return <PageLoader />;

  return (
    <Box>
      <SectionHeader title="Access Logs"
        subtitle={`${logs.length} total records · ${filtered.length} shown`}
        action={
          <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={handleExport} disabled={!filtered.length}>
            Export CSV
          </Button>
        }
      />

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {/* Filter bar */}
        <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
          <TextField size="small" placeholder="Search visitor, reason, entry…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ width: 280, bgcolor: 'background.paper' }} />

          {/* Status filter chips */}
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {STATUS_FILTERS.map(s => (
              <Chip key={s.value} size="small" clickable
                label={s.label}
                onClick={() => { setStatus(s.value); setPage(0); }}
                sx={{
                  fontWeight: 700, fontSize: 11, height: 28,
                  ...(statusFilter === s.value
                    ? { bgcolor: s.bg || 'primary.50', color: s.color, border: '1px solid currentColor' }
                    : { bgcolor: 'background.paper', color: 'text.secondary', border: '1px solid #e2e8f0' }
                  ),
                }}
              />
            ))}
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
            {hasActive && (
              <Button size="small" color="inherit" startIcon={<CloseRoundedIcon />}
                onClick={clearFilters} sx={{ fontSize: 12 }}>
                Clear
              </Button>
            )}
            <Tooltip title={showFilters ? 'Hide filters' : 'More filters'}>
              <IconButton size="small" onClick={() => setShowFilters(f => !f)}
                sx={{ bgcolor: showFilters ? 'primary.50' : 'background.paper', border: '1px solid', borderColor: showFilters ? 'primary.100' : '#e2e8f0', borderRadius: 2 }}>
                <FilterListRoundedIcon fontSize="small" color={showFilters ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Advanced filters */}
        <Collapse in={showFilters}>
          <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper' }}>
              <InputLabel>Entry Point</InputLabel>
              <Select label="Entry Point" value={entryFilter} onChange={e => { setEntry(e.target.value); setPage(0); }}>
                <MenuItem value="all">All entry points</MenuItem>
                {entries.map(e => <MenuItem key={e.id} value={e.name}>{e.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Date from" type="date" InputLabelProps={{ shrink: true }}
              value={dateFrom} onChange={e => setDateFrom(e.target.value)} sx={{ bgcolor: 'background.paper' }} />
            <TextField size="small" label="Date to" type="date" InputLabelProps={{ shrink: true }}
              value={dateTo} onChange={e => setDateTo(e.target.value)} sx={{ bgcolor: 'background.paper' }} />
          </Box>
        </Collapse>

        {filtered.length === 0
          ? <EmptyState icon="🔍" title="No logs match your filters" subtitle="Try adjusting your search or date range."
              action={<Button onClick={clearFilters}>Clear filters</Button>} />
          : <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ width: 36, p: 1 }} />
                      {['Visitor', 'Reason', 'Entry Point', 'Time', 'Status', 'Staff', 'Duration', 'Snapshot'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.5, whiteSpace: 'nowrap' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map(log => (
                      <React.Fragment key={log.id}>
                        <TableRow hover onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                          sx={{
                            cursor: 'pointer',
                            '& td': { fontSize: 13, borderBottom: '1px solid #f1f5f9' },
                            '&:hover': { bgcolor: '#f8fafc' },
                            ...(expanded === log.id ? { bgcolor: '#f0f9ff !important' } : {}),
                          }}>
                          <TableCell sx={{ width: 36, p: 0.5, pl: 1 }}>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                              {expanded === log.id ? <ExpandLessRoundedIcon sx={{ fontSize: 16 }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <AvatarInitials name={log.visitor} size={28} fontSize={11} />
                              <Typography fontSize={13} fontWeight={600} color="text.primary">{log.visitor}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', maxWidth: 140 }}>
                            <Typography fontSize={13} noWrap>{log.reason}</Typography>
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{log.entry}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            <Tooltip title={formatTime(log.time)}>
                              <span>{timeAgo(log.time)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell><StatusChip status={log.status} /></TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{log.staffName || '—'}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{log.duration}</TableCell>
                          <TableCell>
                            {log.hasSnapshot
                              ? <Chip icon={<PhotoCameraRoundedIcon />} label="View" size="small" clickable
                                  sx={{ fontSize: 11, height: 22, bgcolor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }} />
                              : <Typography fontSize={12} color="text.disabled">—</Typography>
                            }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={9} sx={{ p: 0, border: 'none' }}>
                            <Collapse in={expanded === log.id}>
                              <Box sx={{ px: 3.5, py: 2.5, bgcolor: '#f0f9ff', borderTop: '1px solid #bae6fd', borderBottom: '1px solid #e2e8f0' }}>
                                <Typography fontSize={11} fontWeight={700} color="#0284c7" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Session Details
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {[
                                    { label: 'Exact time', value: formatTime(log.time) },
                                    { label: 'Duration', value: log.duration },
                                    { label: 'Handled by', value: log.staffName || 'Auto / voicemail' },
                                    { label: 'Entry point', value: log.entry },
                                    { label: 'Snapshot', value: log.hasSnapshot ? '📸 Available' : 'Not captured' },
                                  ].map(d => (
                                    <Box key={d.label}>
                                      <Typography fontSize={11} color="text.secondary" mb={0.25}>{d.label}</Typography>
                                      <Typography fontSize={13} fontWeight={600} color="text.primary">{d.value}</Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]} component="div"
                count={filtered.length} rowsPerPage={rowsPerPage} page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={e => { setRPP(parseInt(e.target.value, 10)); setPage(0); }}
                sx={{ borderTop: '1px solid', borderColor: 'divider' }}
              />
            </>
        }
      </Paper>
    </Box>
  );
}
