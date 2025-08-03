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
              Hello, I'm Chris Loidolt—an avid learner and creator driven by the belief that the
              world craves more of both.
              <br />
              <br />
              As a Colorado native, I've grown up surrounded by the breathtaking landscapes of
              Monument, which fuel my inspiration and passion for exploration. From an early age,
              I've been immersed in a diverse range of hands-on activities, including building,
              drawing, designing, carving, modeling, programming, soldering, sewing, capturing
              moments through my lens, and even taking to the skies.
              <br />
              <br />
              What truly defines me is my unwavering commitment to creativity and the pursuit of
              excellence. I thrive on infusing every project I undertake with innovation and
              meticulous attention to detail, ensuring the utmost quality in my work. With a
              versatile skill set and a drive to continuously learn and grow, I'm eager to
              contribute my diverse expertise to make a meaningful impact.
            </Typography>
          </Box>
        </ColorPaperContent>
      </ColorPaper>
    </GraphCardWrapper>
  );
}

AboutCard.propTypes = {
  color: PropTypes.object.isRequired
};
