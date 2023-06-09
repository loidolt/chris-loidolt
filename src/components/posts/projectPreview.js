import { Box, Button, Grid, Typography } from '@mui/material';
import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import React from 'react';

import { truncateText } from '../../utils';
import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../colorPaper';
import { GraphCardWrapper } from '../graph';

export default function ProjectPreview({ nodeData }) {
  /* console.log(nodeData); */

  return (
    <GraphCardWrapper nodeData={nodeData}>
      <ColorPaper color={nodeData.color}>
        <ColorPaperTitle color={nodeData.color} title={nodeData.data.Tags} />
        <ColorPaperContent>
          <Box sx={{ width: { xs: '72vw', md: '50vw' }, marginBottom: 2 }}>
            <Grid container spacing={2}>
              {nodeData.data.Cover_Image &&
                nodeData.data.Cover_Image.localFiles &&
                nodeData.data.Cover_Image.localFiles[0] && (
                  <Grid item xs={12} sm={6}>
                    <Link
                      to={'/projects' + nodeData.data.Path}
                      style={{ color: 'inherit', textDecoration: 'inherit' }}>
                      <GatsbyImage
                        sx={{
                          height: '100%'
                        }}
                        image={
                          nodeData.data.Cover_Image.localFiles[0].childImageSharp.gatsbyImageData
                        }
                        alt={nodeData.data.Title + 'Featured Image'}
                        style={{ borderRadius: 10 }}
                      />
                    </Link>
                  </Grid>
                )}
              <Grid
                item
                xs={12}
                md={
                  nodeData.data.Cover_Image &&
                  nodeData.data.Cover_Image.localFiles &&
                  nodeData.data.Cover_Image.localFiles[0]
                    ? 6
                    : 12
                }>
                <Typography
                  gutterBottom
                  variant="h2"
                  sx={{
                    fontSize: { xs: '4vw', sm: '3vw', md: '2vw', lg: '2vw', xl: '2vw' },
                    color: nodeData.color.contrastText,
                    fontWeight: 700
                  }}>
                  {nodeData.data.Title}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="p"
                  sx={{
                    color: nodeData.color.contrastTextg
                  }}>
                  {nodeData.data.Date}
                </Typography>
                <Button
                  variant={'contained'}
                  component={Link}
                  to={'/projects' + nodeData.data.Path}
                  sx={{
                    marginTop: 2,
                    marginBottom: 2,
                    backgroundColor: nodeData.color.light,
                    '&:hover': {
                      backgroundColor: nodeData.color.dark
                    }
                  }}>
                  View Project
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ marginTop: 2, marginBottom: 2 }}>
              {nodeData.data.Excerpt && (
                <Typography
                  variant="body2"
                  component="p"
                  sx={{
                    color: nodeData.color.contrastText
                  }}>
                  {truncateText(nodeData.data.Excerpt)}
                </Typography>
              )}
            </Box>
          </Box>
        </ColorPaperContent>
      </ColorPaper>
    </GraphCardWrapper>
  );
}

ProjectPreview.propTypes = {
  nodeData: PropTypes.object.isRequired
};
