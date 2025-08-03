import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import { Search } from '../algolia';

const Header = ({ siteTitle }) => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          background: theme.palette.background.header,
          borderRadius: 0
        }}>
        <Toolbar sx={{ alignItems: 'center' }}>
          <Typography
            noWrap
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'block', sm: 'block' },
              color: 'inherit',
              textDecoration: 'inherit',
              fontSize: '1.5rem'
            }}>
            {siteTitle}
          </Typography>
          <Search />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string
};

Header.defaultProps = {
  siteTitle: ``
};

export default Header;
