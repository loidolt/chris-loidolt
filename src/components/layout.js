/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import SimpleReactLightbox from "simple-react-lightbox";
import Box from "@mui/material/Box";

import Header from "./header";
import Footer from "./footer";
import "../style.css";

const Layout = ({ children }) => {
  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
              githubUrl
            }
          }
        }
      `}
      render={(data) => (
        <SimpleReactLightbox>
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
          <Footer githubUrl={data.site.siteMetadata.githubUrl}/>
        </SimpleReactLightbox>
      )}
    />
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
