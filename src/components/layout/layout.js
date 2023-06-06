import { Box, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

//firebase
import firebaseApp, { logAnalyticsEvent } from '../../utils/firebase-config';
import Footer from './footer';
import Header from './header';

const Layout = ({ children }) => {
  const theme = useTheme();

  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          githubUrl
          donationLink
        }
      }
    }
  `);

  useEffect(() => {
    if (!firebaseApp()) return;
    logAnalyticsEvent('page_view', window.location.pathname);
  }, []);

  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} />
      <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <Container
          maxWidth="md"
          sx={{
            minHeight: '74vh',
            margin: `0 auto`,
            padding: `0px 1.0875rem 1.45rem`,
            paddingTop: 8
          }}>
          <main>{children}</main>
        </Container>
      </Box>
      <Footer
        githubUrl={data.site.siteMetadata.githubUrl}
        donationLink={data.site.siteMetadata.donationLink}
      />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
