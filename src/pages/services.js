import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Layout from "../components/layout";
import Seo from "../components/seo";

const Services = () => {
  const data = useStaticQuery(graphql`
    query Services {
      allAirtable(
        filter: {
          table: { eq: "Services" }
          data: { Status: { eq: "Published" } }
        }
      ) {
        edges {
          node {
            data {
              URL
              Name
              Subtitle
              Summary
              URL
              More_Info_URL
            }
          }
        }
      }
    }
  `);

  const services = data.allAirtable.edges;

  return (
    <Layout>
      <Seo title="Loidolt Design Public Services" />
      <Typography variant="h3" component="h1" gutterBottom>
        Public Services
      </Typography>
      <Grid container spacing={2}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                backgroundColor: "#1e1e1e",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.43)",
                "&:hover": {
                  boxShadow: "0 15px 35px 0 rgba(0, 0, 0, 0.41)",
                  transition: "all 0.55s ease-in-out",
                },
              }}
            >
              {/* <a target="_blank" rel="noreferrer" href={service.node.data.URL}>
                <GatsbyImage
                  sx={{
                    height: "100%",
                  }}
                  image={
                    service.node.data.Screenshot.localFiles[0].childImageSharp
                      .gatsbyImageData
                  }
                  alt={website.node.data.Name + " Screenshot"}
                />
              </a> */}
              {service.node.data.Summary && (
                <React.Fragment>
                  <CardContent>
                    <Typography
                      sx={{
                        fontSize: "1.6em",
                        fontWeight: "bold",
                        color: "rgba(255, 255, 255, 0.87)",
                      }}
                      gutterBottom
                    >
                      {service.node.data.Name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1em",
                        fontWeight: "bold",
                        color: "rgba(255, 255, 255, 0.38)",
                        textTransform: "uppercase",
                      }}
                      gutterBottom
                    >
                      {service.node.data.Subtitle}
                    </Typography>
                    <Typography gutterBottom>
                      {service.node.data.Summary}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {service.node.data.More_Info_URL && (
                      <Button
                        target="_blank"
                        rel="noreferrer"
                        href={service.node.data.More_Info_URL}
                        size="small"
                      >
                        Learn More
                      </Button>
                    )}
                    {service.node.data.URL && (
                      <Button
                        target="_blank"
                        rel="noreferrer"
                        href={service.node.data.URL}
                        size="small"
                      >
                        View
                      </Button>
                    )}
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

export default Services;
