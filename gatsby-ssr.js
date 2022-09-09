import React from "react";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import "typeface-inter";
import "typeface-inconsolata";

import theme from "./src/theme/theme";
import "./src/theme/style.css";

export const wrapRootElement = ({ element }) => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {element}
        </ThemeProvider>
    )
};