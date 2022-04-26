import React from "react";
import Box from "@mui/material/Box";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'

import { Gallery, Item } from 'react-photoswipe-gallery'

export default function GalleryGrid({ photos, postName, windowWidth }) {

  const setColumns = (width) => {
    if (width < 700) {
      return 1
    } else if (width < 1100) {
      return 2
    } else {
      return 4
    }
  }

  if (photos.length > 1) {
    return (
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        <Gallery>
          <ImageList variant="masonry" cols={setColumns(windowWidth)} gap={12}>
            {photos.map(
              (image, index) =>
                image.publicURL && (
                  <ImageListItem key={index}>
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
                  </ImageListItem>
                )
            )}
          </ImageList>
        </Gallery>
      </Box >
    );
  } else {
    return null;
  }
}
