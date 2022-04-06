import React from "react";
import PropTypes from "prop-types";
import marked from "marked";
import { graphql, navigate } from "gatsby";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { GatsbyImage } from "gatsby-plugin-image";
import Chip from "@mui/material/Chip";

import Layout from "../components/layout";
import Seo from "../components/seo";
import Navigation from "../components/navigation";
import GalleryComponent from "../components/galleryGrid";

import { toKebabCase } from "../helpers";

function getMarkdownText(markdown) {
  var rawMarkup = marked(markdown);
  return { __html: rawMarkup };
}

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
      {(post.Repository || post.Model || post.Attribution) && (
        <Paper
          sx={{
            padding: 2,
            backgroundColor: "#1e1e1e",
            borderRadius: "20px"
          }}
        >
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {post.Repository && (
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  href={post.Repository}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository
                </Button>
              </Grid>
            )}
            {post.Model && (
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  href={post.Model}
                  target="_blank"
                  rel="noreferrer"
                >
                  3D Model
                </Button>
              </Grid>
            )}
            {post.Attribution && (
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  fullWidth
                  color="primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Attribution
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* <ReactMarkdown remarkPlugins={[remarkGfm]} children={post.Markdown} /> */}
      <div dangerouslySetInnerHTML={getMarkdownText(post.Markdown)} />

      {post.Gallery && (
        <GalleryComponent
          columns={(width) => {
            if (width < 700) {
              return 2;
            } else if (width < 1000) {
              return 3;
            } else {
              return 6;
            }
          }}
          postName={post.Title}
          photos={post.Gallery.localFiles}
        />
      )}

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
      }
      id
    }
  }
`;
