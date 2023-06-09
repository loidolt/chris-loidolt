import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

export default function GraphCardWrapper({ children }) {
  /* console.log(nodeData); */

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1001,
        maxHeight: '60vh'
      }}>
      {children}
    </Box>
  );
}

GraphCardWrapper.propTypes = {
  children: PropTypes.node.isRequired
};
