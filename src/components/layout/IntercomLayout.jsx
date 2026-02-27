import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import IntercomSidebar from './IntercomSidebar';
import IntercomTopBar  from './IntercomTopBar';

const FULL = 256;
const MINI = 68;

export default function IntercomLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? MINI : FULL;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Fixed sidebar — renders its own fixed Box internally */}
      <IntercomSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main column pushed right by exactly sidebarWidth */}
      <Box sx={{
        marginLeft: `${sidebarWidth}px`,
        transition: 'margin-left 0.22s ease',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: `calc(100vw - ${sidebarWidth}px)`,
      }}>
        {/* TopBar sits flush at top of this column, no extra ml/width needed */}
        <IntercomTopBar />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
