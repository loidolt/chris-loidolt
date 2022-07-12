import PropTypes from "prop-types";
import React from "react";
import { Link } from "gatsby";
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import WebIcon from "@mui/icons-material/Web";
import MailIcon from "@mui/icons-material/Mail";
import PublicIcon from "@mui/icons-material/Public";

import Search from "./search";

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
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: "#1f1f1f",
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ alignItems: "center" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}
          >
            <Link
              to="/"
              style={{ color: "inherit", textDecoration: "inherit" }}
            >
              {siteTitle}
            </Link>
          </Typography>

          <Search />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#1f1f1f",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            ...theme.mixins.toolbar,
            justifyContent: "flex-end",
          }}
        >
          <IconButton
            onClick={handleDrawerClose}
            size="large"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
            }}
          >
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </Box>
        <List>
          <ListItem
            button
            component={Link}
            to="/"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText>Projects</ListItemText>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/websites"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
            }}
          >
            <ListItemIcon>
              <WebIcon />
            </ListItemIcon>
            <ListItemText>Websites</ListItemText>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/services"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
            }}
          >
            <ListItemIcon>
              <PublicIcon />
            </ListItemIcon>
            <ListItemText>Services</ListItemText>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/about"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
            }}
          >
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText>About</ListItemText>
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/contact"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
            }}
          >
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText>Contact</ListItemText>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
