import { createTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors"

// A custom theme for this app
const rawTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#a9d8f0",
      light: "#ffffff",
      dark: "#056484",
    },
    secondary: {
      main: "#058464",
      light: "#b1ddd1",
      dark: "#006448",
    },
    white: {
      main: "#fff",
    },
    dark: {
      main: "#414042",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 700,
    fontFamilySecondary: '"Inconsolata", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});

const fontHeader = {
  color: rawTheme.palette.text.primary.main,
  fontWeight: rawTheme.typography.fontWeightMedium,
  fontFamily: rawTheme.typography.fontFamily,
}

const theme = {
  ...rawTheme,
  palette: {
    ...rawTheme.palette,
    background: {
      ...rawTheme.palette.background,
      default: rawTheme.palette.background.default,
      placeholder: grey[200],
    },
  },
  typography: {
    ...rawTheme.typography,
    fontHeader,
    h1: {
      ...rawTheme.typography.h1,
      ...fontHeader,
      fontSize: 40,
      letterSpacing: 2,
      fontWeight: 500,
      fontFamily: rawTheme.typography.fontFamily,

      [rawTheme.breakpoints.down("md")]: {
        fontSize: 22,
        letterSpacing: 1,
      },
    },
    h2: {
      ...rawTheme.typography.h2,
      fontFamily: rawTheme.typography.fontFamily,
      ...fontHeader,
      fontSize: 31,
      fontWeight: 400,
      letterSpacing: 2,
      lineHeight: 1.5,
    },
    h3: {
      ...rawTheme.typography.h3,
      ...fontHeader,
      fontSize: 42,
    },
    h4: {
      ...rawTheme.typography.h4,
      ...fontHeader,
      fontSize: 36,
    },
    h5: {
      ...rawTheme.typography.h5,
      fontSize: 20,
      letterSpacing: 1.5,
      fontWeight: 400,
      textTransform: "uppercase",
    },
    h6: {
      ...rawTheme.typography.h6,
      ...fontHeader,
      fontSize: 18,
      letterSpacing: 1.5,
      fontWeight: 400,
      textTransform: "uppercase",
    },
    subtitle1: {
      ...rawTheme.typography.subtitle1,
      fontFamily: rawTheme.typography.fontFamilySecondary,
      fontSize: 20,
      letterSpacing: 2,
      lineHeight: 1.6,
      color: rawTheme.palette.white.main,
      fontWeight: 400,
      [rawTheme.breakpoints.down("md")]: {
        fontSize: 14,
        letterSpacing: 1,
      },
    },
    subtitle2: {
      ...rawTheme.typography.body1,
      fontSize: 15,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    subtitle3: {
      ...rawTheme.typography.body1,
      fontFamily: rawTheme.typography.fontFamilySecondary,
      fontSize: 15,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    body1: {
      ...rawTheme.typography.body2,
      fontSize: 17,
      fontWeight: 300,
      letterSpacing: 1,
      color: rawTheme.palette.dark,
      fontFamily: rawTheme.typography.fontFamilySecondary,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  },
}

export default theme;
