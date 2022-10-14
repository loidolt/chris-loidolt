import React from "react";
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import CssBaseline from "@mui/material/CssBaseline";
import "typeface-inter";
import "typeface-inconsolata";

import theme from "./src/theme/theme";
import "./src/theme/style.css";

import 'react-toastify/dist/ReactToastify.css';

export const wrapRootElement = ({ element }) => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {element}
            <ToastContainer
                pauseOnFocusLoss={false}
            />
        </ThemeProvider>
    )
};