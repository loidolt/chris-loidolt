import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

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

export default function TabArea({ about, images, model, links }) {
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
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {about && <Tab label="About" {...a11yProps(0)} />}
                    {images && <Tab label="Images" {...a11yProps(1)} />}
                    {model && <Tab label="3D Viewer" {...a11yProps(2)} />}
                    {links && <Tab label="Links" {...a11yProps(3)} />}
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                {about}
            </TabPanel>
            <TabPanel value={value} index={1}>
                {images}
            </TabPanel>
            <TabPanel value={value} index={2}>
                {model}
            </TabPanel>
            <TabPanel value={value} index={3}>
                {links}
            </TabPanel>
        </Paper >
    );
}