import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { navigate } from 'gatsby';
import React from 'react';

export default function Navigation({
  previousPath,
  previousLabel,
  nextPath,
  nextLabel,
}) {
  if (!previousPath && !nextPath) {
    return null;
  }
  return (
    <Grid
      container
      spacing={2}
      sx={{
        paddingTop: 10,
        paddingBottom: 10,
      }}
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={6}>
        {previousPath && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<NavigateBefore />}
            onClick={() => navigate(previousPath)}
          >
            {previousLabel}
          </Button>
        )}
      </Grid>
      <Grid item xs={6}>
        {nextPath && (
          <Button
            variant="contained"
            fullWidth
            endIcon={<NavigateNext />}
            onClick={() => navigate(nextPath)}
          >
            {nextLabel}
          </Button>
        )}
      </Grid>
    </Grid>
  );
}
