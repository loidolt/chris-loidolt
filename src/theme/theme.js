import { grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const rawTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#A9D8F0',
      light: '#A9D8F0',
      dark: '#056484'
    },
    secondary: {
      main: '#058464',
      light: '#b1ddd1',
      dark: '#006448'
    },
    white: {
      main: '#fff',
      dark: '#c6c6c6'
    },
    dark: {
      main: '#414042'
    },
    background: {
      default: '#181818',
      header: '#1F1F1F',
      paper: '#1F1F1F'
    }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 700,
    fontFamilySecondary: '"Inconsolata", "Helvetica", "Arial", sans-serif'
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20
        }
      }
    }
  }
});

const fontHeader = {
  color: rawTheme.palette.text.primary.main,
  fontWeight: rawTheme.typography.fontWeightMedium,
  fontFamily: rawTheme.typography.fontFamily
};

const theme = {
  ...rawTheme,
  palette: {
    ...rawTheme.palette,
    background: {
      ...rawTheme.palette.background,
      default: rawTheme.palette.background.default,
      placeholder: grey[200]
    }
  },
  typography: {
    ...rawTheme.typography,
    fontHeader,
    h1: {
      ...fontHeader,
      fontSize: 46,
      fontWeight: 500,
      color: rawTheme.palette.white.main
    },
    h2: {
      ...fontHeader,
      fontSize: 36,
      fontWeight: 500,
      color: rawTheme.palette.white.main
    },
    h3: {
      ...fontHeader,
      fontSize: 28,
      fontWeight: 500,
      color: rawTheme.palette.white.main
    },
    h4: {
      ...fontHeader,
      fontSize: 22,
      fontWeight: 500,
      color: rawTheme.palette.white.main
    },
    h5: {
      ...fontHeader,
      fontSize: 18,
      fontWeight: 500,
      color: rawTheme.palette.white.main
    },
    h6: {
      ...fontHeader,
      fontSize: 14,
      fontWeight: 500,
      color: rawTheme.palette.white.main
    },

    subtitle1: {
      ...rawTheme.typography.subtitle1,
      fontFamily: rawTheme.typography.fontFamilySecondary,
      fontSize: '1rem',
      letterSpacing: 2,
      lineHeight: 1.6,
      color: rawTheme.palette.white.main,
      fontWeight: 400,
      [rawTheme.breakpoints.down('md')]: {
        fontSize: 14,
        letterSpacing: 1
      }
    },
    subtitle2: {
      ...rawTheme.typography.body1,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 2
    },
    subtitle3: {
      ...rawTheme.typography.body1,
      fontFamily: rawTheme.typography.fontFamilySecondary,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 1
    },
    body1: {
      ...rawTheme.typography.body2,
      fontSize: 17,
      fontWeight: 300,
      letterSpacing: 1,
      color: rawTheme.palette.dark,
      fontFamily: rawTheme.typography.fontFamily
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      }
    }
  }
};

export default theme;
