import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image"
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Layout from "../components/layout";
import Seo from "../components/seo";

const Websites = () => {
  const data = useStaticQuery(graphql`
  query Websites {
    allWebsitesJson {
      nodes {
        id
        name
        summary
        url
        image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
  `);

  const websites = data.allWebsitesJson.nodes;

  return (
    <Layout>
      <Seo title="Loidolt Design Websites" />
      <Typography variant="h3" component="h1" gutterBottom>
        Websites
      </Typography>
      <Grid container spacing={2}>
        {websites.map((website, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                backgroundColor: "#1e1e1e",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.87)",
                "&:hover": {
                  boxShadow: "0 15px 35px 0 rgba(0, 0, 0, 0.41)",
                  transition: "all 0.55s ease-in-out",
                },
              }}
            >
              <a target="_blank" rel="noreferrer" href={website.url}>
                <GatsbyImage
                  sx={{
                    height: "100%",
                  }}
                  image={
                    website.image.childImageSharp
                      .gatsbyImageData
                  }
                  alt={website.name + " Screenshot"}
                />
              </a>
              {website.summary && (
                <React.Fragment>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      sx={{
                        color: "#c6c6c6",
                        fontWeight: 700,
                      }}
                    >
                      {website.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="p"
                      sx={{
                        color: "#c6c6c6",
                      }}
                    >
                      {website.summary}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      target="_blank"
                      rel="noreferrer"
                      href={website.url}
                      size="small"
                    >
                      Visit Website
                    </Button>
                  </CardActions>
                </React.Fragment>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default Websites;
