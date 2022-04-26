import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

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

export default function TabArea(props) {
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
                    {props.about && <Tab label="About" {...a11yProps(0)} />}
                    {props.images && <Tab label="Images" {...a11yProps(1)} />}
                    {props.model && <Tab label="3D Viewer" {...a11yProps(2)} />}
                    {props.links && <Tab label="Links" {...a11yProps(3)} />}
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                {props.about}
            </TabPanel>
            <TabPanel value={value} index={1}>
                {props.images}
            </TabPanel>
            <TabPanel value={value} index={2}>
                {props.model}
            </TabPanel>
            <TabPanel value={value} index={3}>
                {props.links}
            </TabPanel>
        </Paper >
    );
}