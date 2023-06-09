import { Grid, Typography } from '@mui/material';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import { Layout, Navigation, Seo } from '../components/layout';
import { PostCard } from '../components/posts';

const IndexPage = ({ data, pageContext: { nextPagePath, previousPagePath } }) => {
  const {
    allAirtable: { edges: posts }
  } = data;

  return (
    <Layout>
      <Typography variant="h1" gutterBottom>
        Workshop
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {posts.map(({ node }) => {
          const {
            id,
            data: { Title, Date, Cover_Image, Tags, Excerpt, Path }
          } = node;
          if (Title || Date || Cover_Image || Tags || Excerpt || Path) {
            return (
              <Grid item xs={12} sm={6} key={id}>
                <PostCard
                  title={Title}
                  date={Date}
                  path={Path}
                  coverImage={Cover_Image.localFiles[0]}
                  tags={Tags}
                  excerpt={Excerpt}
                />
              </Grid>
            );
          }
          return null;
        })}
      </Grid>
      <Navigation
        previousPath={previousPagePath}
        previousLabel="Newer"
        nextPath={nextPagePath}
        nextLabel="Older"
      />
    </Layout>
  );
};

export function Head() {
  return <Seo title="Workshop Projects" />;
}

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    nextPagePath: PropTypes.string,
    previousPagePath: PropTypes.string
  })
};

export const postsQuery = graphql`
  query AllPosts($skip: Int!, $limit: Int!) {
    allAirtable(
      filter: { data: { Status: { eq: "Published" } }, table: { eq: "Posts" } }
      sort: { data: { Date: DESC } }
      skip: $skip
      limit: $limit
    ) {
      edges {
        node {
          data {
            Tags
            Title
            Path
            Excerpt
            Date(formatString: "DD MMMM YYYY")
            Cover_Image {
              localFiles {
                childImageSharp {
                  gatsbyImageData(width: 600, quality: 50)
                }
              }
            }
          }
          id
        }
      }
    }
  }
`;

export default IndexPage;
