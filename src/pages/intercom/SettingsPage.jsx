import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Switch,
  Alert, Select, MenuItem, FormControl, InputLabel, Chip, Divider,
} from '@mui/material';
import SaveRoundedIcon           from '@mui/icons-material/SaveRounded';
import SecurityRoundedIcon       from '@mui/icons-material/SecurityRounded';
import NotificationsRoundedIcon  from '@mui/icons-material/NotificationsRounded';
import WarningAmberRoundedIcon   from '@mui/icons-material/WarningAmberRounded';
import ShieldRoundedIcon         from '@mui/icons-material/ShieldRounded';
import VideoSettingsRoundedIcon  from '@mui/icons-material/VideoSettingsRounded';
import { useSnackbar } from 'notistack';
import { SectionHeader } from '../../components/common';

const RETENTION = [
  { value: '7', label: '7 days' }, { value: '14', label: '14 days' },
  { value: '30', label: '30 days (recommended)' }, { value: '60', label: '60 days' },
  { value: '90', label: '90 days' }, { value: '0', label: 'Do not store' },
];

function Section({ icon, title, subtitle, children, iconBg = '#f0f9ff', iconColor = '#0ea5e9' }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {React.cloneElement(icon, { sx: { color: iconColor, fontSize: 20 } })}
        </Box>
        <Box>
          <Typography fontWeight={800} fontSize={15}>{title}</Typography>
          {subtitle && <Typography fontSize={12} color="text.secondary">{subtitle}</Typography>}
        </Box>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f8fafc', '&:last-child': { borderBottom: 'none', pb: 0 } }}>
      <Box sx={{ flex: 1, pr: 2 }}>
        <Typography fontSize={14} fontWeight={600}>{label}</Typography>
        <Typography fontSize={12} color="text.secondary" mt={0.25}>{desc}</Typography>
      </Box>
      <Switch checked={checked} onChange={e => onChange(e.target.checked)} color="primary" />
    </Box>
  );
}

export default function SettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [privacy, setPrivacy] = useState({ snapshotRetentionDays: '30', encryptSessions: true, storeVisitorNames: true });
  const [notifs, setNotifs]   = useState({ missedCallAlert: true, voicemailEmailAlert: true, offlineEntryAlert: true, dailyDigest: false, repeatFailedAlert: true });
  const [security, setSecurity] = useState({
    videoEnabled: true, snapshotOnlyMode: false, enforceHTTPS: true, rateLimitEnabled: true,
    rateLimitScansPerMin: 10, sessionTimeout: 120, alertOnRepeatedFails: true, failedAttemptsThreshold: 5,
  });
  const save = (s) => enqueueSnackbar(`${s} settings saved`, { variant: 'success' });

  return (
    <Box sx={{ maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SectionHeader title="System Settings" subtitle="Security, notifications, privacy, and system controls" />

      {/* Security & Video */}
      <Section icon={<VideoSettingsRoundedIcon />} title="Video & Session Controls" subtitle="Configure video, snapshot mode, and session behavior" iconBg="#faf5ff" iconColor="#7c3aed">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <ToggleRow label="Video calling enabled" desc="Allow visitors to initiate video calls with staff" checked={security.videoEnabled} onChange={v => setSecurity(s => ({ ...s, videoEnabled: v }))} />
          <ToggleRow label="Snapshot-only mode" desc="Capture image only — no live video stream stored" checked={security.snapshotOnlyMode} onChange={v => setSecurity(s => ({ ...s, snapshotOnlyMode: v }))} />
          <ToggleRow label="Enforce HTTPS / WebRTC encryption" desc="All audio/video streams encrypted in transit" checked={security.enforceHTTPS} onChange={v => setSecurity(s => ({ ...s, enforceHTTPS: v }))} />
        </Box>
        <Grid container spacing={2} sx={{ mt: 1.5 }}>
          <Grid item xs={6}>
            <TextField fullWidth label="Session timeout (sec)" type="number" value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: parseInt(e.target.value) }))} helperText="Auto-end if no answer" inputProps={{ min: 30, max: 600 }} />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Video & session')}>Save</Button>
        </Box>
      </Section>

      {/* Rate Limiting & Abuse */}
      <Section icon={<ShieldRoundedIcon />} title="Rate Limiting & Abuse Protection" subtitle="Prevent QR scan abuse and brute-force attempts" iconBg="#f0fdf4" iconColor="#10b981">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 2 }}>
          <ToggleRow label="QR scan rate limiting" desc="Limit how many sessions can be initiated per minute" checked={security.rateLimitEnabled} onChange={v => setSecurity(s => ({ ...s, rateLimitEnabled: v }))} />
          <ToggleRow label="Alert on repeated failed access" desc="Notify admins when the same entry fails multiple times" checked={security.alertOnRepeatedFails} onChange={v => setSecurity(s => ({ ...s, alertOnRepeatedFails: v }))} />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="Max scans per minute" type="number" value={security.rateLimitScansPerMin}
              onChange={e => setSecurity(s => ({ ...s, rateLimitScansPerMin: parseInt(e.target.value) }))}
              disabled={!security.rateLimitEnabled} helperText="Per QR code / IP" inputProps={{ min: 1, max: 60 }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Failed attempts threshold" type="number" value={security.failedAttemptsThreshold}
              onChange={e => setSecurity(s => ({ ...s, failedAttemptsThreshold: parseInt(e.target.value) }))}
              disabled={!security.alertOnRepeatedFails} helperText="Before alert is sent" inputProps={{ min: 2, max: 20 }} />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Security')}>Save</Button>
        </Box>
      </Section>

      {/* Privacy & Retention */}
      <Section icon={<SecurityRoundedIcon />} title="Privacy & Data Retention" subtitle="Control how visitor data is stored and protected" iconBg="#f0f9ff" iconColor="#0ea5e9">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Alert severity="info" sx={{ fontSize: 12, borderRadius: 2 }}>
            Only a single still image is captured per session — no video stored at rest. Longer retention increases storage costs.
          </Alert>
          <FormControl fullWidth>
            <InputLabel>Visitor Snapshot Retention</InputLabel>
            <Select label="Visitor Snapshot Retention" value={privacy.snapshotRetentionDays} onChange={e => setPrivacy(p => ({ ...p, snapshotRetentionDays: e.target.value }))}>
              {RETENTION.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ borderRadius: 2, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <ToggleRow label="End-to-end session encryption" desc="All audio/video streams encrypted in transit" checked={privacy.encryptSessions} onChange={v => setPrivacy(p => ({ ...p, encryptSessions: v }))} />
            <ToggleRow label="Store visitor-provided names in logs" desc="Disable to log sessions anonymously" checked={privacy.storeVisitorNames} onChange={v => setPrivacy(p => ({ ...p, storeVisitorNames: v }))} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Privacy')}>Save</Button>
          </Box>
        </Box>
      </Section>

      {/* Notifications */}
      <Section icon={<NotificationsRoundedIcon />} title="Notification Preferences" subtitle="System-wide alert behaviors for all entry points" iconBg="#fffbeb" iconColor="#d97706">
        <Box sx={{ borderRadius: 2, border: '1px solid #f1f5f9', overflow: 'hidden', mb: 2 }}>
          <ToggleRow label="Missed call alerts" desc="Notify staff when a visitor call goes unanswered" checked={notifs.missedCallAlert} onChange={v => setNotifs(p => ({ ...p, missedCallAlert: v }))} />
          <ToggleRow label="Voicemail email digest" desc="Send email when a visitor leaves a voicemail" checked={notifs.voicemailEmailAlert} onChange={v => setNotifs(p => ({ ...p, voicemailEmailAlert: v }))} />
          <ToggleRow label="Entry point offline alerts" desc="Alert admins when a controller goes offline" checked={notifs.offlineEntryAlert} onChange={v => setNotifs(p => ({ ...p, offlineEntryAlert: v }))} />
          <ToggleRow label="Daily summary digest" desc="Daily email summary of all visitor activity" checked={notifs.dailyDigest} onChange={v => setNotifs(p => ({ ...p, dailyDigest: v }))} />
          <ToggleRow label="Repeated failed access alerts" desc="Alert when multiple failed access attempts detected" checked={notifs.repeatFailedAlert} onChange={v => setNotifs(p => ({ ...p, repeatFailedAlert: v }))} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Notifications')}>Save</Button>
        </Box>
      </Section>

      {/* Danger Zone */}
      <Section icon={<WarningAmberRoundedIcon />} title="Danger Zone" subtitle="Irreversible actions — proceed with extreme caution" iconBg="#fef2f2" iconColor="#dc2626">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[
            { label: 'Clear All Access Logs',       desc: 'Permanently delete all visitor logs and snapshots',              btn: 'Clear Logs' },
            { label: 'Reset All QR Codes',          desc: 'Regenerate all QR codes — all printed codes stop working',       btn: 'Reset QR Codes' },
            { label: 'Revoke All Staff Sessions',   desc: 'Force sign-out all staff from the admin dashboard',             btn: 'Revoke Sessions' },
          ].map(z => (
            <Box key={z.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2.5, border: '1px solid #fecaca', borderRadius: 2.5, bgcolor: '#fffafa' }}>
              <Box>
                <Typography fontSize={14} fontWeight={700} color="error.main">{z.label}</Typography>
                <Typography fontSize={12} color="text.secondary" mt={0.25}>{z.desc}</Typography>
              </Box>
              <Button variant="outlined" color="error" size="small" sx={{ flexShrink: 0, fontWeight: 700 }}>{z.btn}</Button>
            </Box>
          ))}
        </Box>
      </Section>
    </Box>
  );
}
