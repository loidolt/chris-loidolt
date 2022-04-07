import React from "react";
import PropTypes from "prop-types";
import { graphql, navigate } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Layout from "../components/layout";
import Seo from "../components/seo";
import TabArea from "../components/tabArea"
import Navigation from "../components/navigation";
import Markdown from "../components/markdown"
import GalleryComponent from "../components/galleryGrid";

import { toKebabCase } from "../helpers";

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
        {post.Tags.map((tag) => (
          <Chip
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
        about={<Markdown>{post.Markdown}</Markdown>}
        images={
          post.Gallery && (
            <GalleryComponent
              postName={post.Title}
              photos={post.Gallery.localFiles}
            />
          )}
        model={
          post.Model && (
            <div>
              <Button variant="contained" href={post.Model} target="__blank">
                View 3D Model
              </Button>
            </div>
          )}
        links={
          (post.Repository || post.Attribution) && (
            <List dense={true}>
              {post.Repository && (
                <ListItem>
                  <ListItemText
                    primary={'Repository'}
                    secondary={post.Repository}
                  />
                </ListItem>
              )}
              {post.Attribution && (
                <ListItem>
                  <ListItemText
                    primary={'Attribution'}
                    secondary={post.Attribution}
                  />
                </ListItem>
              )}
            </List>
          )
        }
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
  pageContext: PropTypes.shape({
    next: PropTypes.object,
    previous: PropTypes.object,
  }),
};

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
            publicURL
          }
        }
        Markdown
        Repository
        Model
        Tags
        Title
        Path
        glb-model
      }
      id
    }
  }
`;
