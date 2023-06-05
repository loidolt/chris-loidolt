import { Box, Paper, Tab, Tabs } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

import GalleryComponent from './galleryGrid';
import Markdown from './markdown';
import ModelViewer from './modelViewer';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`post-tabpanel-${index}`}
      aria-labelledby={`post-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3, minHeight: 240 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

function a11yProps(index) {
  return {
    id: `post-tab-${index}`,
    'aria-controls': `post-tabpanel-${index}`
  };
}

a11yProps.propTypes = {
  index: PropTypes.number.isRequired
};

export default function TabArea({ title, about, images, model }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper variant="outlined" sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="post tabs"
          variant="fullWidth"
          scrollButtons="auto">
          <Tab label="About" {...a11yProps(0)} />
          {images && images.localFiles && <Tab label="Images" {...a11yProps(1)} />}
          {model && <Tab label="3D Viewer" {...a11yProps(2)} />}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Markdown>{about}</Markdown>
      </TabPanel>
      {images && images.localFiles && (
        <TabPanel value={value} index={1}>
          <GalleryComponent postName={title} photos={images.localFiles} />
        </TabPanel>
      )}
      {model && (
        <TabPanel value={value} index={2}>
          <ModelViewer file={model} />
        </TabPanel>
      )}
    </Paper>
  );
}

TabArea.propTypes = {
  title: PropTypes.string.isRequired,
  about: PropTypes.string.isRequired,
  images: PropTypes.object,
  model: PropTypes.string
};
