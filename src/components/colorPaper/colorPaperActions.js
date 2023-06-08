import { Typography } from '@mui/material';
import React from 'react';

export default function ColorPaperActions({ color, invert, children }) {
  return (
    <Typography
      variant="h2"
      sx={{
        position: 'absolute',
        bottom: '-10%',
        left: '-2%',
        color: invert ? color.paperBackground : color.main,
        fontSize: '5rem',
        zIndex: 0
      }}>
      {children}
    </Typography>
  );
}
