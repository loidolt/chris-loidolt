import { Button, Grid, Stack, Typography } from '@mui/material';
import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';

import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../components/colorPaper';
import { Layout, Seo } from '../components/layout';
import { colors } from '../theme/pastelColors';

const Services = () => {
  const data = useStaticQuery(graphql`
    query Services {
      allAirtable(filter: { table: { eq: "Services" }, data: { Status: { eq: "Published" } } }) {
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
    <Layout color={colors[2]}>
      <Typography variant="h1" gutterBottom>
        Public Services
      </Typography>
      <Grid container spacing={2}>
        {services.map((service, index) => (
          <Grid item xs={12} key={index}>
            <ColorPaper color={colors[index % colors.length]} title={service.data.Name}>
              <ColorPaperTitle color={colors[index % colors.length]} title={service.data.Name} />
              {service.data.Summary && (
                <ColorPaperContent>
                  <Typography variant="h2" gutterBottom>
                    {service.data.Subtitle}
                  </Typography>
                  <Typography gutterBottom>{service.data.Summary}</Typography>
                  <Stack
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                    sx={{ marginTop: 2, marginBottom: 2 }}>
                    {service.data.More_Info && (
                      <Button
                        variant={'contained'}
                        target="_blank"
                        rel="noreferrer"
                        href={service.data.More_Info}
                        sx={{
                          backgroundColor: colors[index % colors.length].light,
                          '&:hover': {
                            backgroundColor: colors[index % colors.length].dark
                          }
                        }}>
                        Learn More
                      </Button>
                    )}
                    {service.data.URL && (
                      <Button
                        variant={'contained'}
                        target="_blank"
                        rel="noreferrer"
                        href={service.data.URL}
                        sx={{
                          backgroundColor: colors[index % colors.length].light,
                          '&:hover': {
                            backgroundColor: colors[index % colors.length].dark
                          }
                        }}>
                        View Service
                      </Button>
                    )}
                  </Stack>
                </ColorPaperContent>
              )}
            </ColorPaper>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export const Head = () => <Seo title="Public Services" />;

export default Services;
