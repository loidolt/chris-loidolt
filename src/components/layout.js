import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import Box from "@mui/material/Box";

import { app, analytics } from '../utils/firebase-config';

import Header from "./header";
import Footer from "./footer";
import "../style.css";

const Layout = ({ children }) => {

  React.useEffect(() => {
    if (!app) return;
    analytics.logEvent(analytics, window.location.pathname);
  }, [app]);

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
          <Box sx={{ backgroundColor: "#121212" }}>
            <Box
              sx={{
                display: "flex",
                minHeight: "88vh",
                margin: `0 auto`,
                maxWidth: 960,
                padding: `0px 1.0875rem 1.45rem`,
                paddingTop: 8,
              }}
            >
              <main>{children}</main>
            </Box>
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
