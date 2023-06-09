import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import React from 'react';

import { truncateText } from '../../utils';
import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../colorPaper';
import { GraphCardWrapper } from '../graph';

export default function QualificationsCard({ nodeData }) {
  /* console.log(nodeData); */

  return (
    <GraphCardWrapper>
      <ColorPaper color={nodeData.color}>
        <ColorPaperTitle color={nodeData.color} title={nodeData.data.Category} />
        <ColorPaperContent>
          <Box sx={{ width: { xs: '72vw', md: '50vw' }, marginBottom: 10 }}>
            <Grid container spacing={2}>
              {nodeData.data.Image &&
                nodeData.data.Image.localFiles &&
                nodeData.data.Image.localFiles[0] && (
                  <Grid item xs={12} sm={6}>
                    <Link
                      to={nodeData.data.Path}
                      style={{ color: 'inherit', textDecoration: 'inherit' }}>
                      <GatsbyImage
                        sx={{
                          height: '100%'
                        }}
                        image={nodeData.data.Image.localFiles[0].childImageSharp.gatsbyImageData}
                        alt={nodeData.data.Name + 'Featured Image'}
                        style={{ borderRadius: 10 }}
                      />
                    </Link>
                  </Grid>
                )}
              <Grid
                item
                xs={12}
                md={
                  nodeData.data.Image &&
                  nodeData.data.Image.localFiles &&
                  nodeData.data.Image.localFiles[0]
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
                  {nodeData.data.Name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="p"
                  sx={{
                    color: nodeData.color.contrastTextg
                  }}>
                  {nodeData.data.Type} {nodeData.data.Level && ` | ${nodeData.data.Level}`}
                </Typography>
                <Stack
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                  sx={{ marginTop: 2, marginBottom: 2 }}>
                  {nodeData.data.More_Info && (
                    <Button
                      variant={'contained'}
                      target="_blank"
                      rel="noreferrer"
                      href={nodeData.data.More_Info}
                      sx={{
                        backgroundColor: nodeData.color.light,
                        '&:hover': {
                          backgroundColor: nodeData.color.dark
                        }
                      }}>
                      More Info
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
            <Box sx={{ marginTop: 2, marginBottom: 2 }}>
              {nodeData.data.Summary && (
                <Typography
                  variant="body2"
                  component="p"
                  sx={{
                    color: nodeData.color.contrastText
                  }}>
                  {truncateText(nodeData.data.Summary)}
                </Typography>
              )}
            </Box>
          </Box>
        </ColorPaperContent>
      </ColorPaper>
    </GraphCardWrapper>
  );
}

QualificationsCard.propTypes = {
  nodeData: PropTypes.object.isRequired
};
