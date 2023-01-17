import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'typeface-inconsolata';
import 'typeface-inter';

import './src/theme/style.css';
import theme from './src/theme/theme';

export const wrapRootElement = ({ element }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {element}
      <ToastContainer pauseOnFocusLoss={false} />
    </ThemeProvider>
  );
};
