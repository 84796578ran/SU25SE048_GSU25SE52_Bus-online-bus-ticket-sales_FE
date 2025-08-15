/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client';

import { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import LoginTemplatePage from './LoginPageClient';

function LoginFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={60} sx={{ color: '#e91e63' }} />
      <Typography variant="h6" sx={{ color: 'text.secondary' }}>
        Đang tải trang đăng nhập...
      </Typography>
    </Box>
  );
}

export default function LoginClientWrapper() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginTemplatePage />
    </Suspense>
  );
}
