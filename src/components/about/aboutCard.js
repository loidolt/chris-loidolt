import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../colorPaper';
import { GraphCardWrapper } from '../graph';

export default function AboutCard({ color }) {
  /* console.log(nodeData); */

  return (
    <GraphCardWrapper>
      <ColorPaper color={color} invert>
        <ColorPaperTitle color={color} title={'Who Am I?'} invert />
        <ColorPaperContent>
          <Box sx={{ paddingBottom: { xs: 2, sm: 4 } }}>
            <Typography
              variant="body1"
              sx={{
                color: color.contrastText
              }}>
              My name is Chris Loidolt.
              <br />
              <br />
              I like learning and creating. I strongly believe the world needs more of that.
              <br />
              <br />
              Born and raised in Colorado, I now live in Monument and enjoy taking advantage of what
              this beautiful place has to offer. I have been building, drawing, designing, carving,
              modeling, programming, soldering, sewing, capturing, and flying for as long as I can
              remember.
              <br />
              <br />
              My personality can be best defined by my level of creativity and quality in work.
            </Typography>
          </Box>
        </ColorPaperContent>
      </ColorPaper>
    </GraphCardWrapper >
  );
}

AboutCard.propTypes = {
  color: PropTypes.object.isRequired
};
