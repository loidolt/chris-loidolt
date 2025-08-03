import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

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

  return (
    <>
      <Header siteTitle={data.site.siteMetadata.title} color={color} />
      <Box sx={{ backgroundColor: theme.palette.background.default }}>{children}</Box>
    </>
  );
};

GraphLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default GraphLayout;
