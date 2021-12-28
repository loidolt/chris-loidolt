import React from "react";
import Typography from "@mui/material/Typography";
import Layout from "../components/layout";
import Seo from "../components/seo";

const NotFoundPage = () => (
  <Layout>
    <Seo title="404: Not found" />
    <Typography variant="h3" component="h1" gutterBottom>
      NOT FOUND
    </Typography>
    <Typography>
      You just hit a route that doesn&#39;t exist... the sadness.
    </Typography>
  </Layout>
);

export default NotFoundPage;
