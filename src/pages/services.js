import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';

import { Layout, Seo } from '../components/layout';

const Services = () => {
  const data = useStaticQuery(graphql`
    query Services {
      allAirtable(
        filter: {
          table: { eq: "Services" }
          data: { Status: { eq: "Published" } }
        }
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

  const theme = useTheme();

  const services = data.allAirtable.nodes;

  return (
    <Layout>
      <Typography variant="h3" component="h1" gutterBottom>
        Public Services
      </Typography>
      <Grid container spacing={2}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.43)',
                borderRadius: '20px',
                '&:hover': {
                  boxShadow: '0 15px 35px 0 rgba(0, 0, 0, 0.41)',
                  transition: 'all 0.55s ease-in-out',
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
                        fontSize: '1.6em',
                        fontWeight: 'bold',
                        color: 'rgba(255, 255, 255, 0.87)',
                      }}
                      gutterBottom
                    >
                      {service.data.Name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1em',
                        fontWeight: 'bold',
                        color: 'rgba(255, 255, 255, 0.38)',
                        textTransform: 'uppercase',
                      }}
                      gutterBottom
                    >
                      {service.data.Subtitle}
                    </Typography>
                    <Typography gutterBottom>{service.data.Summary}</Typography>
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
                        variant={'contained'}
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

export const Head = () => <Seo title="Public Services" />;

export default Services;
