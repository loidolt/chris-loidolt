import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

//firebase
import firebaseApp, { logAnalyticsEvent } from '../../utils/firebase-config';
import Footer from './footer';
import Header from './header';

const GraphLayout = ({ color, children }) => {
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
      <Header siteTitle={data.site.siteMetadata.title} color={color} />
      <Box sx={{ backgroundColor: theme.palette.background.default }}>{children}</Box>
      <Footer
        color={color}
        githubUrl={data.site.siteMetadata.githubUrl}
        donationLink={data.site.siteMetadata.donationLink}
      />
    </>
  );
};

GraphLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default GraphLayout;
