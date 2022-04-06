import React from "react";
import { Link } from "gatsby";
import Box from "@mui/material/Box";
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';

import FooterChart from "./footerChart";

export default function Footer(props) {
  return (
    <Box>
      <FooterChart />
      <Box
        sx={{
          padding: 4,
          marginTop: -12,
          color: "#ffffff",
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
              <IconButton href={props.githubUrl}>
                <GitHubIcon />
              </IconButton>
              <IconButton component={Link} to={"/contact"}>
                <EmailIcon />
              </IconButton>
            </Box>
          </Stack>
        </footer>
      </Box>
    </Box>
  );
}
