import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Layout from "../components/layout";
import Seo from "../components/seo";

const Services = () => {
  const data = useStaticQuery(graphql`
  query Services {
    allAirtable(
      filter: {table: {eq: "Services"}, data: {Status: {eq: "Published"}}}
    ) {
      nodes {
        data {
          Name
          More_Info
          Subtitle
          Summary
          URL
          Image {
            localFiles {
              childImageSharp {
                gatsbyImageData
              }
              name
              publicURL
            }
          }
        }
      }
    }
  }
`);

  const services = data.allAirtable.nodes;

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
                borderRadius: "20px",
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
              {service.data.Summary && (
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
                      {service.data.Name}
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
                      {service.data.Subtitle}
                    </Typography>
                    <Typography gutterBottom>
                      {service.data.Summary}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    spacing={2}
                    sx={{ padding: 2 }}
                  >
                    {service.data.More_Info && (
                      <Button
                        target="_blank"
                        rel="noreferrer"
                        href={service.data.More_Info}
                      >
                        Learn More
                      </Button>
                    )}
                    {service.data.URL && (
                      <Button
                        variant={"contained"}
                        target="_blank"
                        rel="noreferrer"
                        href={service.data.URL}
                      >
                        View Service
                      </Button>
                    )}
                  </Stack>
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
