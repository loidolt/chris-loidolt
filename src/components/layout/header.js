import {
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  Mail,
  Menu,
  Public,
  Web
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import { Search } from '../algolia';

const menuList = [
  { title: 'Projects', link: '/', icon: <Home /> },
  { title: 'Websites', link: '/websites', icon: <Web /> },
  { title: 'Services', link: '/services', icon: <Public /> },
  { title: 'About', link: '/about', icon: <Info /> },
  { title: 'Contact', link: '/contact', icon: <Mail /> }
];

const drawerWidth = 240;

const Header = ({ siteTitle }) => {
  const theme = useTheme();

  const [open, setOpen] = React.useState(false);

  function handleDrawerOpen() {
    setOpen(true);
  }

  function handleDrawerClose() {
    setOpen(false);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          background: theme.palette.background.header,
          borderRadius: 0
        }}>
        <Toolbar sx={{ alignItems: 'center' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            sx={{ mr: 2 }}>
            <Menu />
          </IconButton>

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
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: theme.palette.background.header,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }
        }}
        variant="persistent"
        anchor="left"
        open={open}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end'
          }}>
          <IconButton
            onClick={handleDrawerClose}
            size="large"
            sx={{
              color: theme.palette.white.dark
            }}>
            {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
        <List>
          {menuList.map((item, index) => (
            <ListItem
              key={index}
              button
              component={Link}
              to={item.link}
              sx={{
                color: theme.palette.white.main
              }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.title}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Drawer>
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
