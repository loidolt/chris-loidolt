import React from "react";
import { graphql } from "gatsby";
import { Grid, Typography } from "@mui/material";

import { Layout, Seo, Navigation } from "../components/layout";
import { PostCard } from "../components/posts";


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
      <Typography variant="h1" component="h1" gutterBottom>
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

export const Head = ({ tag }) => (
  <Seo title={tag + " Projects Loidolt Design"} />
)

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
