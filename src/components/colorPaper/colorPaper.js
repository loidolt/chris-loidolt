import { Box, Paper } from '@mui/material';
import React from 'react';

export default function ColorPaper({ color, invert, children }) {
  return (
    <Paper
      sx={{
        position: 'relative',
        backgroundColor: invert ? color.dark : `${color.paperBackground}F7`,
        borderColor: color.main,
        borderStyle: invert ? 'none' : 'solid',
        borderWidth: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 2,
        marginBottom: 2,
        height: '100%',
        overflow: 'hidden',
        boxShadow: `0 3px 10px ${color.dark}33`,
        '&:hover': {
          boxShadow: `0 15px 35px 0 ${color.dark}31`,
          transition: 'all 0.25s ease-in-out'
        }
      }}>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1
        }}>
        {children}
      </Box>
    </Paper>
  );
}
