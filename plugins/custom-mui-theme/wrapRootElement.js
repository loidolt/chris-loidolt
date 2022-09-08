import React from "react";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import "typeface-inter";
import "typeface-inconsolata";

import theme from "./theme";
import "./style.css";

export const wrapRootElement = ({ element }) => {
    console.info(`theme`, theme);
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        {element}
    </ThemeProvider>
};