import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import { List, ListItem, ListItemText, ListItemSecondaryAction, Grid, Typography, IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";
import { useTheme } from '@mui/material/styles';

import { Layout, Seo } from "../components/layout";

import { groupBy } from "../utils";

const About = () => {
  const data = useStaticQuery(graphql`
    query About {
      placeholderImage: file(relativePath: { eq: "AboutPagePicture.jpg" }) {
        childImageSharp {
          gatsbyImageData(width: 600, quality: 50)
        }
      }
      allAirtable(filter: {table: {eq: "Qualifications"}}) {
        nodes {
          data {
            Name
            Category
            Level
            Type
            More_Info
          }
        }
      }
    }
  `);

  const theme = useTheme();

  const qualifications = data.allAirtable.nodes;
  //console.log(qualifications);

  // Get all types and filter unique values
  let allTypes = [];
  qualifications.map((qual) => {
    return allTypes.push(qual.data.Type);
  });
  let types = [...new Set(allTypes)];
  //console.log(types);

  // Filter By Type
  let items = function (type) {
    let filtered = qualifications.filter(
      (qual) => qual.data.Type === type
    );
    /* console.log(filtered); */
    // Group By Category
    let grouped = groupBy(filtered, (qual) => qual.data.Category);
    /* console.log(Object.entries(grouped)); */
    return Object.entries(grouped);
  };

  return (
    <Layout>
      <Typography variant="h3" component="h1" gutterBottom>
        Who Am I?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.white.dark,
            }}
          >
            My name is Chris Loidolt.
            <br />
            <br />
            I like learning and creating. I strongly believe the world needs
            more of that.
            <br />
            <br />
            Born and raised in Colorado, I now live in Monument and enjoy taking
            advantage of what this beautiful place has to offer. I have been
            building, drawing, designing, carving, modeling, programming,
            soldering, sewing, capturing, and flying for as long as I can
            remember.
            <br />
            <br />
            My personality can be best defined by my level of creativity and
            quality in work. Speak softly and carry an impressive portfolio.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <GatsbyImage
            image={data.placeholderImage.childImageSharp.gatsbyImageData}
            alt={"Chris Loidolt Profile Picture"}
            style={{ borderRadius: "20px" }}
          />
        </Grid>
      </Grid>
      {types.map((type, index) => (
        <Grid container spacing={2} key={index}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                marginTop: 4,
                color: "rgba(255, 255, 255, 0.87)",
              }}
            >
              {type}
            </Typography>
          </Grid>
          {items(type).map((category, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  textTransform: "uppercase",
                  color: theme.palette.white.dark,
                }}
              >
                {category[0]}
              </Typography>
              <List
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.white.main,
                  borderRadius: "20px",
                }}
              >
                {category[1].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.data.Name}
                      secondary={item.data.Level || ""}
                      secondaryTypographyProps={{
                        style: { color: theme.palette.white.dark },
                      }}
                    />
                    {item.data.More_Info && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="more-info"
                          href={item.data.More_Info}
                          target="_blank"
                          rel="noreferrer"
                          size="large"
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <Info />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
        </Grid>
      ))}
    </Layout>
  );
};

export const Head = () => (
  <Seo title="About" />
)

export default About;
