import React from "react";
import { navigate } from "gatsby";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

export default function Navigation({ previousPath, previousLabel, nextPath, nextLabel }) {
  if (!previousPath || !nextPath) {
    return null
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
            startIcon={<NavigateBeforeIcon />}
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
            endIcon={<NavigateNextIcon />}
            onClick={() => navigate(nextPath)}
          >
            {nextLabel}
          </Button>
        )}
      </Grid>
    </Grid>
  );
}