import { Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import React from 'react';

import { Layout, Seo } from '../components/layout';

const Websites = () => {
  const data = useStaticQuery(graphql`
    query Websites {
      allAirtable(filter: { table: { eq: "Websites" }, data: { Status: { eq: "Published" } } }) {
        nodes {
          data {
            Name
            Status_URL
            URL
            Summary
            Image {
              localFiles {
                childImageSharp {
                  gatsbyImageData
                }
                name
                publicURL
              }
            }
            Status
          }
        }
      }
    }
  `);

  const theme = useTheme();

  const websites = data.allAirtable.nodes;

  return (
    <Layout>
      <Typography variant="h3" component="h1" gutterBottom>
        Websites
      </Typography>
      <Grid container spacing={2}>
        {websites.map((website, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.87)',
                borderRadius: '20px',
                '&:hover': {
                  boxShadow: '0 15px 35px 0 rgba(0, 0, 0, 0.41)',
                  transition: 'all 0.55s ease-in-out'
                }
              }}>
              <a target="_blank" rel="noreferrer" href={website.data.URL}>
                <GatsbyImage
                  sx={{
                    height: '100%'
                  }}
                  image={website.data.Image.localFiles[0].childImageSharp.gatsbyImageData}
                  alt={website.data.Name + ' Screenshot'}
                  style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                />
              </a>
              {website.data.Summary && (
                <React.Fragment>
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h3"
                      sx={{
                        color: theme.palette.white.dark,
                        fontWeight: 700
                      }}>
                      {website.data.Name}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="p"
                      sx={{
                        color: theme.palette.white.dark
                      }}>
                      {website.data.Summary}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    spacing={2}
                    sx={{ padding: 2 }}>
                    {website.data.Status_URL && (
                      <Button target="_blank" rel="noreferrer" href={website.data.Status_URL}>
                        Status
                      </Button>
                    )}
                    {website.data.URL && (
                      <Button
                        variant={'contained'}
                        target="_blank"
                        rel="noreferrer"
                        href={website.data.URL}>
                        Visit Website
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

export const Head = () => <Seo title="Websites" />;

export default Websites;
