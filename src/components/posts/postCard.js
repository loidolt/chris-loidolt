import { Card, CardActions, CardContent, Chip, Divider, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, navigate } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import React from 'react';
import PropTypes from 'prop-types';

import { toKebabCase } from '../../utils';

export default function PostCard({ title, date, path, coverImage, excerpt, tags }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.43)',
        borderRadius: '20px',
        '&:hover': {
          boxShadow: '0 15px 35px 0 rgba(0, 0, 0, 0.41)',
          transition: 'all 0.55s ease-in-out'
        }
      }}>
      <Link to={path} style={{ color: 'inherit', textDecoration: 'inherit' }}>
        {coverImage && (
          <GatsbyImage
            sx={{
              height: '100%'
            }}
            image={coverImage.childImageSharp.gatsbyImageData}
            alt={title + 'Featured Image'}
            style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          />
        )}
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            sx={{
              color: theme.palette.white.dark,
              fontWeight: 700
            }}>
            {title}
          </Typography>

          <Typography
            variant="body2"
            component="p"
            sx={{
              color: theme.palette.white.dark
            }}>
            {excerpt}
          </Typography>
          <Typography
            variant="subtitle1"
            component="p"
            sx={{
              color: theme.palette.white.dark,
              float: 'right'
            }}>
            {date}
          </Typography>
        </CardContent>
      </Link>
      <Divider light sx={{ marginTop: 1 }} />
      <CardActions>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={'#' + tag}
            variant="outlined"
            sx={{
              color: theme.palette.white.dark,
              borderColor: theme.palette.white.dark,
              '&:hover': {
                backgroundColor: theme.palette.white.main
              }
            }}
            onClick={() => navigate(`/tag/${toKebabCase(tag)}/`)}
          />
        ))}
      </CardActions>
    </Card>
  );
}

PostCard.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  coverImage: PropTypes.object,
  excerpt: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired
};
