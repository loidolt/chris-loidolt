import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { GraphCardWrapper } from '.';
import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../colorPaper';

export default function CategoryCard({ nodeData }) {
  //console.log(nodeData);

  return (
    <GraphCardWrapper>
      <ColorPaper color={nodeData.color} invert>
        <ColorPaperTitle color={nodeData.color} title={'Category'} invert />
        <ColorPaperContent>
          <Box sx={{ paddingBottom: { xs: 2, sm: 4 } }}>
            <Typography
              gutterBottom
              variant="h2"
              sx={{
                fontSize: { xs: '4vw', sm: '3vw', md: '2vw', lg: '2vw', xl: '2vw' },
                color: nodeData.color.contrastText,
                fontWeight: 700
              }}>
              {nodeData.data.Name}
            </Typography>
            {nodeData.data.Description && (
              <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                {nodeData.data.Summary && (
                  <Typography
                    variant="body2"
                    component="p"
                    sx={{
                      color: nodeData.color.contrastText
                    }}>
                    {nodeData.data.Description}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </ColorPaperContent>
      </ColorPaper>
    </GraphCardWrapper>
  );
}

CategoryCard.propTypes = {
  nodeData: PropTypes.object.isRequired
};
