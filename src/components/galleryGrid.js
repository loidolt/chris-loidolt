import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'

import { Gallery, Item } from 'react-photoswipe-gallery'

export default function GalleryGrid({ photos, postName }) {
  if (photos.length > 1) {
    return (
      <Box
        sx={{
          marginTop: 10,
          flexGrow: 1,
        }}
      >
        <Gallery>
          <Grid container spacing={3}>
            {photos.map(
              (image, index) =>
                image.publicURL && (
                  <Grid item xs={6} md={4}>
                    <Item
                      original={image.publicURL}
                      thumbnail={image.publicURL}
                      width="1024"
                      height="768"
                    >
                      {({ ref, open }) => (
                        <img
                          ref={ref}
                          onClick={open}
                          width="100%"
                          src={image.publicURL}
                          alt={postName + " " + index}
                          style={{ borderRadius: "10px", }}
                        />
                      )}

                    </Item>
                  </Grid>
                )
            )}
          </Grid>
        </Gallery>
      </Box>
    );
  } else {
    return null;
  }
}
