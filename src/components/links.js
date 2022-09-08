import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemButton, ListItemIcon } from '@mui/material';
import { GitHub, Favorite, ViewInAr } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export default function Links({
    repository,
    attribution,
    model_link,
}) {

    const theme = useTheme();

    if (!repository && !attribution && !model_link) {
        return null
    }

    return (
        <Box sx={{ paddingTop: 4 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Links:
            </Typography>

            <List dense >
                {repository && (
                    <ListItem sx={{ color: theme.palette.white.main }}>
                        <ListItemButton component="a" href={repository} target="__blank">
                            <ListItemIcon>
                                <GitHub />
                            </ ListItemIcon>
                            <ListItemText
                                primary={'Git Repository'}
                                secondary={repository}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
                {model_link && (
                    <ListItem sx={{ color: theme.palette.white.main }}>
                        <ListItemButton component="a" href={model_link} target="__blank">
                            <ListItemIcon>
                                <ViewInAr />
                            </ ListItemIcon>
                            <ListItemText
                                primary={'Downloadable 3D Model'}
                                secondary={model_link}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
                {attribution && (
                    <ListItem sx={{ color: theme.palette.white.main }}>
                        <ListItemButton component="a" href={attribution} target="__blank">
                            <ListItemIcon>
                                <Favorite />
                            </ ListItemIcon>
                            <ListItemText
                                primary={'Attribution'}
                                secondary={attribution}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );
}