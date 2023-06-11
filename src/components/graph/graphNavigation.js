import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useRef, useState } from 'react';

const GraphNavigation = ({ groupColors, onGroupSelect, selectedGroup }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = ['all', 'projects', 'work', 'services', 'qualifications', 'contact', 'about'];

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    onGroupSelect(menuItems[index]);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ position: 'fixed', top: 80, left: 20, zIndex: 1000 }}>
      {matches ? (
        <>
          <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
            <Button
              sx={{
                borderWidth: 2,
                backgroundColor:
                  selectedGroup && groupColors[selectedGroup]
                    ? groupColors[selectedGroup].light
                    : groupColors[menuItems[0]].light,
                '&:hover': {
                  backgroundColor:
                    selectedGroup && groupColors[selectedGroup]
                      ? groupColors[selectedGroup].dark
                      : groupColors[menuItems[0]].dark
                }
              }}
              onClick={() => onGroupSelect(menuItems[selectedIndex])}>
              {menuItems[selectedIndex].charAt(0).toUpperCase() + menuItems[selectedIndex].slice(1)}
            </Button>
            <Button
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select group"
              aria-haspopup="menu"
              onClick={handleToggle}
              sx={{
                borderWidth: 2,
                backgroundColor:
                  selectedGroup && groupColors[selectedGroup]
                    ? groupColors[selectedGroup].light
                    : groupColors[menuItems[0]].light,
                '&:hover': {
                  backgroundColor:
                    selectedGroup && groupColors[selectedGroup]
                      ? groupColors[selectedGroup].dark
                      : groupColors[menuItems[0]].dark
                }
              }}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Popper
            sx={{
              zIndex: 30
            }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
                }}>
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" autoFocusItem={open}>
                      {menuItems.map((option, index) => (
                        <MenuItem
                          key={option}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </>
      ) : (
        <Stack spacing={1}>
          {menuItems.map((option) => (
            <Button
              key={option}
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select group"
              aria-haspopup="menu"
              onClick={() => onGroupSelect(option)}
              sx={{
                borderWidth: 2,
                color: groupColors[option].contrastText,
                borderColor:
                  selectedGroup === option ? groupColors[option].dark : groupColors[option].main,
                borderStyle: 'solid',
                backgroundColor:
                  selectedGroup === option ? groupColors[option].light : groupColors[option].main,
                '&:hover': {
                  borderColor: groupColors[option].dark,
                  backgroundColor: groupColors[option].dark
                }
              }}>
              {option}
            </Button>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default GraphNavigation;
