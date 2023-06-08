import { Typography } from '@mui/material';
import React from 'react';

export default function ColorPaperTitle({ color, title, invert }) {
  return (
    <Typography
      variant="h2"
      sx={{
        position: 'absolute',
        bottom: -6,
        right: 12,
        color: invert ? color.paperBackground : color.main,
        fontSize: { xs: '8vw', sm: '7vw', md: '6vw', lg: '5vw', xl: '4vw' },
        zIndex: 0
      }}>
      {title}
    </Typography>
  );
}
