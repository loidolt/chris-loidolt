import React from "react";
import { Link } from "gatsby";
import Box from "@mui/material/Box";
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import useTheme from '@mui/material/styles/useTheme';

import FooterChart from "./footerChart";

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
          fontFamily: '"Inconsolata", "Helvetica", "Arial", sans-serif',
        }}>
        <footer>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              Loidolt Design © {new Date().getFullYear()}
            </Box>
            <Box>
              <Tooltip title="Make A Donation">
                <IconButton href={donationLink} target={"_blank"}>
                  <CardGiftcardIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="My GitHub Profile">
                <IconButton href={githubUrl} target={"_blank"}>
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Contact Me">
                <IconButton component={Link} to={"/contact"}>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </footer>
      </Box>
    </Box>
  );
}
