import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
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
      allAirtable(
        filter: {
          table: { eq: "Websites" }
          data: { Status: { eq: "Published" } }
        }
        sort: { fields: data___Sort_Order }
      ) {
        edges {
          node {
            data {
              URL
              Name
              Summary
              Screenshot {
                localFiles {
                  childImageSharp {
                    gatsbyImageData
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  const websites = data.allAirtable.edges;

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
              <a target="_blank" rel="noreferrer" href={website.node.data.URL}>
                <GatsbyImage
                  sx={{
                    height: "100%",
                  }}
                  image={
                    website.node.data.Screenshot.localFiles[0].childImageSharp
                      .gatsbyImageData
                  }
                  alt={website.node.data.Name + " Screenshot"}
                />
              </a>
              {website.node.data.Summary && (
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
                      {website.node.data.Name}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="p"
                      sx={{
                        color: "#c6c6c6",
                      }}
                    >
                      {website.node.data.Summary}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      target="_blank"
                      rel="noreferrer"
                      href={website.node.data.URL}
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
