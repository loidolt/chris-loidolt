import React from "react";
import { graphql, navigate } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import Layout from "../components/layout";
import Seo from "../components/seo";
import TabArea from "../components/tabArea"
import Navigation from "../components/navigation";
import Links from "../components/links";

import { toKebabCase } from "../utils";

export default function PostTemplate({ data, pageContext }) {
  const post = data.airtable.data;

  return (
    <Layout>
      <Seo title={post.Title} description={post.Excerpt} />
      <Typography
        variant="subtitle1"
        component="p"
        sx={{
          color: "rgba(255, 255, 255, 0.38)",
          float: "right",
        }}
      >
        {post.Date}
      </Typography>
      <Typography variant="h3" component="h1" gutterBottom>
        {post.Title}
      </Typography>
      <Box
        sx={{
          paddingBottom: 2,
        }}
      >
        {post.Tags.map((tag, index) => (
          <Chip
            key={index}
            label={"#" + tag}
            variant="outlined"
            sx={{
              marginRight: 1,
              color: "rgba(255, 255, 255, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.38)",
              backgroundColor: "#1d1d1d",
              "&:hover": {
                backgroundColor: "#2c2c2c",
              },
            }}
            onClick={() => navigate(`/tag/${toKebabCase(tag)}/`)}
          />
        ))}
      </Box>
      {post.Cover_Image && (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item sx={{
            marginBottom: 2,
            borderRadius: "20px"
          }}>
            <GatsbyImage
              image={
                post.Cover_Image.localFiles[0].childImageSharp.gatsbyImageData
              }
              alt={post.Title + " Featured Image"}
              style={{ borderRadius: "20px" }}
            />
          </Grid>
        </Grid>
      )}

      <TabArea
        title={post.Title}
        about={post.Markdown}
        images={post.Gallery}
        models={post.Model}
        repository={post.Repository}
        attribution={post.Attribution}
        model_link={post.Model}
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
    </Layout >
  );
}

export const pageQuery = graphql`
query getPost($id: String) {
  airtable(id: {eq: $id}) {
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
      Model {
        filename
        url
        type
      }
    }
    id
  }
}
`;
