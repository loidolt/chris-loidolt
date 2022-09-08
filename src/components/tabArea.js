import React from 'react';
import { Tab, Tabs, Box, Paper } from '@mui/material';

import Markdown from "./markdown"
import GalleryComponent from "./galleryGrid";
import ModelViewer from "./modelViewer";

function TabPanel({ children, value, index, ...other }) {

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`post-tabpanel-${index}`}
            aria-labelledby={`post-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, minHeight: 240 }}>
                    {children}
                </Box>
            )
            }
        </div >
    );
}
function a11yProps(index) {
    return {
        id: `post-tab-${index}`,
        'aria-controls': `post-tabpanel-${index}`,
    };
}

export default function TabArea({
    title,
    about,
    images,
    models,
}) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Paper variant="outlined" sx={{ width: '100%' }} >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="post tabs"
                    variant="fullWidth"
                    scrollButtons="auto"
                >
                    <Tab label="About" {...a11yProps(0)} />
                    {images && images.localFiles && <Tab label="Images" {...a11yProps(1)} />}
                    {models && <Tab label="3D Viewer" {...a11yProps(2)} />}
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <Markdown>{about}</Markdown>
            </TabPanel>
            {images &&
                images.localFiles && (
                    <TabPanel value={value} index={1}>
                        <GalleryComponent
                            postName={title}
                            photos={images.localFiles}
                        />
                    </TabPanel>
                )}
            {models && (
                <TabPanel value={value} index={2}>
                    <ModelViewer file={models[0].url} />
                </TabPanel>
            )}
        </Paper >
    );
}