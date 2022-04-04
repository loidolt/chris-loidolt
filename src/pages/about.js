import React from "react";
import * as _ from "underscore";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import InfoIcon from "@mui/icons-material/Info";

import Layout from "../components/layout";
import Seo from "../components/seo";

const About = () => {
  const data = useStaticQuery(graphql`
    query About {
      placeholderImage: file(relativePath: { eq: "AboutPagePicture.jpg" }) {
        childImageSharp {
          gatsbyImageData
        }
      }
      allQualificationsJson {
        nodes {
          level
          more_info
          name
          type
          id
          category
        }
      }
    }
  `);

  const qualifications = data.allQualificationsJson.nodes;

  // Get all types and filter unique values
  let allTypes = [];
  qualifications.map((qual) => {
    return allTypes.push(qual.type);
  });
  let types = [...new Set(allTypes)];
  //console.log(types);

  // Filter By Type
  let items = function (type) {
    let filtered = qualifications.filter(
      (qual) => qual.type === type
    );
    //console.log(filtered);
    // Group By Category
    let grouped = _.groupBy(filtered, (qual) => qual.category);
    //console.log(Object.entries(grouped));
    return Object.entries(grouped);
  };

  return (
    <Layout>
      <Seo title="About Loidolt Design" />
      <Typography variant="h3" component="h1" gutterBottom>
        Who Am I?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.87)",
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
          <Paper>
            <GatsbyImage
              sx={{
                borderRadius: "10px",
                marginBottom: -6,
              }}
              image={data.placeholderImage.childImageSharp.gatsbyImageData}
              alt={"Chris Loidolt Profile Picture"}
            />
          </Paper>
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
                  color: "rgba(255, 255, 255, 0.38)",
                }}
              >
                {category[0]}
              </Typography>
              <List
                sx={{
                  backgroundColor: "#1e1e1e",
                  color: "rgba(255, 255, 255, 0.87)",
                  borderRadius: "10px",
                }}
              >
                {category[1].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.name}
                      secondary={item.level || ""}
                      secondaryTypographyProps={{
                        style: { color: "rgba(255, 255, 255, 0.38)" },
                      }}
                    />
                    {item.more_info && (
                      <ListItemSecondaryAction>
                        <IconButton
                          color="primary"
                          edge="end"
                          aria-label="more-info"
                          href={item.more_info}
                          target="_blank"
                          rel="noreferrer"
                          size="large"
                        >
                          <InfoIcon />
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

export default About;
