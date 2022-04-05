import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
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
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    subtitle1: {
      fontFamily: '"Inconsolata", "Helvetica", "Arial", sans-serif',
    },
    subtitle2: {
      fontFamily: '"Inconsolata", "Helvetica", "Arial", sans-serif',
    },
    caption: {
      fontFamily: '"Inconsolata", "Helvetica", "Arial", sans-serif',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
