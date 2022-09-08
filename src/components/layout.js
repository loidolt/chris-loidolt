import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import { Box, Container } from "@mui/material";
import { useTheme } from '@mui/material/styles';
//firebase
import firebaseApp, { logAnalyticsEvent } from '../utils/firebase-config';

import Header from "./header";
import Footer from "./footer";

const Layout = ({ children }) => {
  const theme = useTheme();

  React.useEffect(() => {
    if (!firebaseApp()) return;
    logAnalyticsEvent('page_view', window.location.pathname);
  }, []);

  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
              githubUrl
              donationLink
            }
          }
        }
      `}
      render={(data) => (
        <>
          <Header siteTitle={data.site.siteMetadata.title} />
          <Box sx={{ backgroundColor: theme.palette.background.default }}>
            <Container
              maxWidth="md"
              sx={{
                minHeight: "74vh",
                margin: `0 auto`,
                padding: `0px 1.0875rem 1.45rem`,
                paddingTop: 8,
              }}>
              <main>{children}</main>
            </Container>
          </Box>
          <Footer githubUrl={data.site.siteMetadata.githubUrl} donationLink={data.site.siteMetadata.donationLink} />
        </>
      )}
    />
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
