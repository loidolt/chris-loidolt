import { CardGiftcard, Email, GitHub } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

import FooterChart from './footerChart';

export default function Footer({ githubUrl, donationLink }) {
  const theme = useTheme();

  return (
    <Box>
      <FooterChart />
      <Box
        sx={{
          padding: 4,
          marginTop: -12,
          color: theme.palette.white.main,
          fontFamily: '"Inconsolata", "Helvetica", "Arial", sans-serif'
        }}
      >
        <footer>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>Loidolt Design © {new Date().getFullYear()}</Box>
            <Box>
              <Tooltip title="Make A Donation">
                <IconButton href={donationLink} target={'_blank'}>
                  <CardGiftcard />
                </IconButton>
              </Tooltip>
              <Tooltip title="My GitHub Profile">
                <IconButton href={githubUrl} target={'_blank'}>
                  <GitHub />
                </IconButton>
              </Tooltip>
              <Tooltip title="Contact Me">
                <IconButton component={Link} to={'/contact'}>
                  <Email />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </footer>
      </Box>
    </Box>
  );
}

Footer.propTypes = {
  githubUrl: PropTypes.string.isRequired,
  donationLink: PropTypes.string.isRequired
};
