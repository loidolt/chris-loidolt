import { Box, Button, Stack } from '@mui/material';
import React from 'react';

const GraphNavigation = ({ groupColors, onGroupSelect, selectedGroup }) => {
  return (
    <Box sx={{ position: 'fixed', top: 80, left: 20, zIndex: 1000 }}>
      <Stack spacing={1}>
        <Button variant={'contained'} onClick={() => onGroupSelect(null)}>
          All
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('projects')}
          sx={{
            borderWidth: 2,
            borderColor:
              selectedGroup === 'projects' ? groupColors.project.dark : groupColors.project.light,
            borderStyle: 'solid',
            backgroundColor: groupColors.project.light,
            '&:hover': {
              borderColor:
                selectedGroup === 'projects' ? groupColors.project.dark : groupColors.project.light,
              backgroundColor: groupColors.project.dark
            }
          }}>
          Projects
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('work')}
          sx={{
            borderWidth: 2,
            borderColor: selectedGroup === 'work' ? groupColors.work.dark : groupColors.work.light,
            borderStyle: 'solid',
            backgroundColor: groupColors.work.light,
            '&:hover': {
              borderColor:
                selectedGroup === 'work' ? groupColors.work.dark : groupColors.work.light,
              backgroundColor: groupColors.work.dark
            }
          }}>
          Work
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('services')}
          sx={{
            borderWidth: 2,
            borderColor:
              selectedGroup === 'services' ? groupColors.service.dark : groupColors.service.light,
            borderStyle: 'solid',
            backgroundColor: groupColors.service.light,
            '&:hover': {
              borderColor:
                selectedGroup === 'services' ? groupColors.service.dark : groupColors.service.light,
              backgroundColor: groupColors.service.dark
            }
          }}>
          Services
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('qualifications')}
          sx={{
            borderWidth: 2,
            borderColor:
              selectedGroup === 'qualifications'
                ? groupColors.qualification.dark
                : groupColors.qualification.light,
            borderStyle: 'solid',
            backgroundColor: groupColors.qualification.light,
            '&:hover': {
              borderColor:
                selectedGroup === 'qualifications'
                  ? groupColors.qualification.dark
                  : groupColors.qualification.light,
              backgroundColor: groupColors.qualification.dark
            }
          }}>
          Qualifications
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('contact')}
          sx={{
            borderWidth: 2,
            borderColor:
              selectedGroup === 'contact' ? groupColors.contact.dark : groupColors.contact.light,
            borderStyle: 'solid',
            backgroundColor: groupColors.contact.light,
            '&:hover': {
              borderColor:
                selectedGroup === 'contact' ? groupColors.contact.dark : groupColors.contact.light,
              backgroundColor: groupColors.contact.dark
            }
          }}>
          Contact
        </Button>
        <Button
          variant={'contained'}
          onClick={() => onGroupSelect('central')}
          sx={{
            borderWidth: 2,
            borderColor:
              selectedGroup === 'central' ? groupColors.central.dark : groupColors.central.light,
            borderStyle: 'solid',
            backgroundColor: groupColors.central.light,
            '&:hover': {
              borderColor:
                selectedGroup === 'central' ? groupColors.central.dark : groupColors.central.light,
              backgroundColor: groupColors.central.dark
            }
          }}>
          About
        </Button>
      </Stack>
    </Box>
  );
};

export default GraphNavigation;
