import { Box, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import React from 'react';

import { Layout, Navigation, Seo } from '../components/layout';
import { Links, TabArea } from '../components/posts';

export default function PostTemplate({ data, pageContext }) {
  const theme = useTheme();

  const post = data.airtable.data;

  return (
    <Layout>
      <Typography variant="h1" component="h1" gutterBottom>
        {post.Title}
      </Typography>
      <Box
        sx={{
          paddingBottom: 2
        }}>
        {post.Tags.map((tag, index) => (
          <Chip
            key={index}
            label={'#' + tag}
            variant="outlined"
            sx={{
              marginRight: 1,
              color: theme.palette.white.dark,
              borderColor: theme.palette.white.dark,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.background.default
              }
            }}
          />
        ))}
        <Typography
          variant="subtitle1"
          component="p"
          sx={{
            color: 'rgba(255, 255, 255, 0.38)',
            float: 'right'
          }}>
          {post.Date}
        </Typography>
      </Box>
      {post.Cover_Image && (
        <Box
          sx={{
            marginBottom: 2,
            borderRadius: '20px'
          }}>
          <GatsbyImage
            image={post.Cover_Image.localFiles[0].childImageSharp.gatsbyImageData}
            alt={post.Title + ' Featured Image'}
            style={{ borderRadius: '20px' }}
          />
        </Box>
      )}

      <TabArea
        title={post.Title}
        about={post.Markdown}
        images={post.Gallery}
        model={post.ModelPath}
      />

      <Links
        repository={post.Repository}
        attribution={post.Attribution}
        model_link={post.Model_URL}
      />

      <Navigation
        previousPath={pageContext.previousPostPath}
        previousLabel={pageContext.previousPostTitle}
        nextPath={pageContext.nextPostPath}
        nextLabel={pageContext.nextPostTitle}
      />
    </Layout>
  );
}

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired
};

export function Head({ data }) {
  return <Seo title={data.airtable.data.Title} description={data.airtable.data.Excerpt} />;
}

export const pageQuery = graphql`
  query getPost($id: String) {
    airtable(id: { eq: $id }) {
      data {
        Attribution
        Cover_Image {
          localFiles {
            childImageSharp {
              gatsbyImageData(width: 1024)
            }
          }
        }
        Date(formatString: "DD MMMM YYYY")
        Excerpt
        Gallery {
          localFiles {
            childImageSharp {
              gatsbyImageData
            }
            name
            publicURL
          }
        }
        Markdown
        Repository
        Model_URL
        Tags
        Title
        Path
        ModelPath
      }
      id
    }
  }
`;
