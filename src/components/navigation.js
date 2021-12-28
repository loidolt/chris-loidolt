import React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

export default function Navigation(props) {
  if (props.previousPath || props.nextPath) {
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
          {props.previousPath && (
            <Button
              variant="contained"
              fullWidth
              color="primary"
              startIcon={<NavigateBeforeIcon />}
              onClick={() => navigate(props.previousPath)}
            >
              {props.previousLabel}
            </Button>
          )}
        </Grid>
        <Grid item xs={6}>
          {props.nextPath && (
            <Button
              variant="contained"
              fullWidth
              color="primary"
              endIcon={<NavigateNextIcon />}
              onClick={() => navigate(props.nextPath)}
            >
              {props.nextLabel}
            </Button>
          )}
        </Grid>
      </Grid>
    );
  } else {
    return null;
  }
}

Navigation.propTypes = {
  nextPath: PropTypes.string,
  previousPath: PropTypes.string,
  nextLabel: PropTypes.string,
  previousLabel: PropTypes.string,
};
