import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import PostCard from "../components/postCard";
import Seo from "../components/seo";
import Navigation from "../components/navigation";

const TagsPage = ({
  data,
  pageContext: { nextPagePath, previousPagePath, tag },
}) => {
  const {
    allAirtable: { edges: posts },
  } = data;

  return (
    <Layout>
      <Seo title={tag + " Projects Loidolt Design"} />
      <Typography variant="h3" component="h1" gutterBottom>
        #{tag}
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {posts.map(({ node }) => {
          const {
            id,
            data: { Title, Date, Cover_Image, Tags, Excerpt, Path },
          } = node;

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

TagsPage.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    nextPagePath: PropTypes.string,
    previousPagePath: PropTypes.string,
  }),
};

export const postsQuery = graphql`
  query AllPostsbyTag($skip: Int!, $limit: Int!, $tag: String) {
    allAirtable(
      filter: {
        data: { Status: { eq: "Published" }, Tags: { eq: $tag } }
        table: { eq: "Posts" }
      }
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

export default TagsPage;
