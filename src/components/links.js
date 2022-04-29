import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import GitHubIcon from '@mui/icons-material/GitHub';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

export default function Links({
    repository,
    attribution,
    model_link,
}) {

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
                    <ListItem>
                        <ListItemButton component="a" href={repository} target="__blank">
                            <ListItemIcon>
                                <GitHubIcon />
                            </ ListItemIcon>
                            <ListItemText
                                primary={'Git Repository'}
                                secondary={repository}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
                {model_link && (
                    <ListItem>
                        <ListItemButton component="a" href={model_link} target="__blank">
                            <ListItemIcon>
                                <ViewInArIcon />
                            </ ListItemIcon>
                            <ListItemText
                                primary={'Downloadable 3D Model'}
                                secondary={model_link}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
                {attribution && (
                    <ListItem>
                        <ListItemButton component="a" href={attribution} target="__blank">
                            <ListItemIcon>
                                <FavoriteIcon />
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