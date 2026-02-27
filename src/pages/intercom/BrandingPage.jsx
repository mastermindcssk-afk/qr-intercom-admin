import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Divider, Switch, Alert,
} from '@mui/material';
import SaveRoundedIcon      from '@mui/icons-material/SaveRounded';
import PaletteRoundedIcon   from '@mui/icons-material/PaletteRounded';
import PhoneRoundedIcon     from '@mui/icons-material/PhoneRounded';
import LanguageRoundedIcon  from '@mui/icons-material/LanguageRounded';
import QrCode2RoundedIcon   from '@mui/icons-material/QrCode2Rounded';
import { useSnackbar } from 'notistack';
import { SectionHeader } from '../../components/common';

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

function VisitorPreview({ branding }) {
  return (
    <Box sx={{ maxWidth: 300, mx: 'auto' }}>
      <Box sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Box sx={{ p: 3, background: `linear-gradient(135deg, ${branding.primaryColor}22, ${branding.primaryColor}08)`, borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
          {branding.logoUrl ? (
            <Box component="img" src={branding.logoUrl} sx={{ height: 40, objectFit: 'contain', mb: 1 }} />
          ) : (
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, mx: 'auto', mb: 1, background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.primaryColor}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode2RoundedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
          )}
          <Typography fontWeight={800} fontSize={16} color="text.primary">{branding.businessName}</Typography>
          <Typography fontSize={12} color="text.secondary" mt={0.5}>{branding.welcomeMessage}</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Visit Reason</Typography>
          {['📦 Delivery', '📅 Meeting', '🤝 Client Visit'].map(reason => (
            <Box key={reason} sx={{ p: 1.5, mb: 1, borderRadius: 2, border: `1.5px solid ${branding.primaryColor}33`, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
              '&:hover': { bgcolor: `${branding.primaryColor}10` } }}>
              <Typography fontSize={13} fontWeight={600}>{reason}</Typography>
            </Box>
          ))}
          {branding.instructionText && (
            <Typography fontSize={11} color="text.secondary" mt={1.5} textAlign="center">{branding.instructionText}</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function BrandingPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [branding, setBranding] = useState({
    businessName: 'Acme Corp',
    primaryColor: '#0ea5e9',
    welcomeMessage: 'Welcome! Please check in below.',
    instructionText: 'Select your visit reason to proceed.',
    logoUrl: '',
    backgroundImageUrl: '',
    multiLanguage: false,
    language: 'en',
  });

  const set = (k, v) => setBranding(b => ({ ...b, [k]: v }));
  const save = (section) => enqueueSnackbar(`${section} saved successfully`, { variant: 'success' });

  return (
    <Box sx={{ maxWidth: 900 }}>
      <SectionHeader title="Branding & Visitor UI" subtitle="Customize how visitors experience your intercom check-in screen" />

      <Grid container spacing={3}>
        {/* Left: Settings */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Section icon={<PaletteRoundedIcon />} title="Brand Identity" subtitle="Logo, colors, and company name">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField fullWidth label="Business Name" value={branding.businessName} onChange={e => set('businessName', e.target.value)} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField fullWidth label="Logo URL (optional)" placeholder="https://cdn.company.com/logo.png" value={branding.logoUrl} onChange={e => set('logoUrl', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography fontSize={11} fontWeight={700} color="text.secondary" mb={0.75} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Brand Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 54, border: '1px solid #e2e8f0', borderRadius: 2.5, px: 1.5 }}>
                        <input type="color" value={branding.primaryColor} onChange={e => set('primaryColor', e.target.value)}
                          style={{ width: 32, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6, padding: 0 }} />
                        <Typography fontSize={12} fontWeight={700} sx={{ fontFamily: 'monospace' }}>{branding.primaryColor}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Branding')}>Save Branding</Button>
                </Box>
              </Box>
            </Section>

            <Section icon={<PhoneRoundedIcon />} title="Visitor Copy" subtitle="Text shown on the check-in screen" iconBg="#f0fdf4" iconColor="#10b981">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField fullWidth label="Welcome Message" value={branding.welcomeMessage} onChange={e => set('welcomeMessage', e.target.value)} helperText="Shown at the top of the check-in screen" />
                <TextField fullWidth label="Instruction Text" value={branding.instructionText} onChange={e => set('instructionText', e.target.value)} helperText="Shown below the visit reason buttons" multiline rows={2} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Visitor copy')}>Save Copy</Button>
                </Box>
              </Box>
            </Section>

            <Section icon={<LanguageRoundedIcon />} title="Multi-Language Support" subtitle="Show check-in screen in multiple languages" iconBg="#fffbeb" iconColor="#d97706">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Box>
                    <Typography fontSize={14} fontWeight={600}>Enable Multi-Language</Typography>
                    <Typography fontSize={12} color="text.secondary">Auto-detect visitor's browser language</Typography>
                  </Box>
                  <Switch checked={branding.multiLanguage} onChange={e => set('multiLanguage', e.target.checked)} color="primary" />
                </Box>
                {branding.multiLanguage && (
                  <Alert severity="info" sx={{ fontSize: 12, borderRadius: 2 }}>
                    When enabled, the visitor portal will automatically display in the visitor's browser language if supported. Supported: English, Spanish, French, German, Chinese, Japanese.
                  </Alert>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={() => save('Language settings')}>Save Settings</Button>
                </Box>
              </Box>
            </Section>
          </Box>
        </Grid>

        {/* Right: Live Preview */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 80 }}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                <Typography fontWeight={800} fontSize={14}>Live Preview</Typography>
                <Typography fontSize={12} color="text.secondary">How visitors see your check-in screen</Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <VisitorPreview branding={branding} />
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
