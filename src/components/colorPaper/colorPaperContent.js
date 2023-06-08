import { Box } from '@mui/material';
import React from 'react';

export default function ColorPaperContent({ children }) {
  return (
    <Box
      sx={{
        padding: 4
      }}>
      {children}
    </Box>
  );
}
