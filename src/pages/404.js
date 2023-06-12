import { Typography } from '@mui/material';
import React from 'react';

import { Layout, Seo } from '../components/layout';

const NotFoundPage = () => (
  <Layout>
    <Typography component="h1" gutterBottom>
      NOT FOUND
    </Typography>
    <Typography>You just hit a route that doesn&#39;t exist... the sadness.</Typography>
  </Layout>
);

export const Head = () => <Seo title="404: Not found" />;

export default NotFoundPage;
