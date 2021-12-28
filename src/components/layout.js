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
import "../style.css";

const Layout = ({ children }) => {
  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={(data) => (
        <SimpleReactLightbox>
          <Box sx={{ minHeight: "100vh", backgroundColor: "#121212" }}>
            <Header siteTitle={data.site.siteMetadata.title} />
            <Box
              sx={{
                margin: `0 auto`,
                maxWidth: 960,
                padding: `0px 1.0875rem 1.45rem`,
                paddingTop: 8,
              }}
            >
              <main>{children}</main>
              <footer
                style={{
                  paddingTop: 10,
                  paddingBottom: 20,
                  color: "rgba(255, 255, 255, 0.38)",
                  fontFamily: '"Inconsolata", "Helvetica", "Arial", sans-serif',
                }}
              >
                Loidolt Design © {new Date().getFullYear()}
              </footer>
            </Box>
          </Box>
        </SimpleReactLightbox>
      )}
    />
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
