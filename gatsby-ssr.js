import React from "react"
import { ThemeProvider } from "@mui/material"
import "typeface-inter";
import "typeface-inconsolata";

import theme from "./src/theme"
import "./src/style.css"

export const wrapRootElement = ({ element }) => (
    <ThemeProvider theme={theme}>
        {element}
    </ThemeProvider>
)
