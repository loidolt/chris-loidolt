import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import { Grid, Typography } from "@mui/material";

import { PostCard } from "../components/posts";
import { Layout, Seo, Navigation } from "../components/layout";

const IndexPage = ({
  data,
  pageContext: { nextPagePath, previousPagePath },
}) => {
  const {
    allAirtable: { edges: posts },
  } = data;

  return (
    <Layout>
      <Typography variant="h1" gutterBottom>
        Projects
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {posts.map(({ node }) => {
          const {
            id,
            data: { Title, Date, Cover_Image, Tags, Excerpt, Path },
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

export const Head = () => (
  <Seo title="Projects" />
)

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    nextPagePath: PropTypes.string,
    previousPagePath: PropTypes.string,
  }),
};

export const postsQuery = graphql`
  query AllPosts($skip: Int!, $limit: Int!) {
    allAirtable(
      filter: { data: { Status: { eq: "Published" } }, table: { eq: "Posts" } }
      sort: { fields: data___Date, order: DESC }
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
