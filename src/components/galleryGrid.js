import React from "react";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'
import { Gallery, Item } from 'react-photoswipe-gallery'

import useWindowSize from "../hooks/useGatsbyWindowSize";

export default function GalleryGrid({ photos, postName }) {

  const { windowWidth } = useWindowSize();

  const setColumns = (width) => {
    if (width < 700) {
      return 1
    } else if (width < 1000) {
      return 2
    } else {
      return 4
    }
  }

  if (photos.length > 1) {
    return (
      <Gallery >
        <ImageList variant="masonry" cols={setColumns(windowWidth)} gap={12}>
          {photos.map(
            (image, index) =>
              image.url && (
                <ImageListItem key={index}>
                  <Item
                    id={postName + " " + index}
                    original={image.url}
                    thumbnail={image.thumbnails.small.url}
                    width={image.width}
                    height={image.height}
                    alt={postName + " " + index}
                  >
                    {({ ref, open }) => (
                      <img
                        ref={ref}
                        onClick={open}
                        width="100%"
                        src={image.url}
                        alt={postName + " " + index}
                        style={{
                          cursor: 'pointer',
                          objectFit: 'cover',
                          width: '100%',
                          maxHeight: '100%',
                          borderRadius: "10px",
                        }}
                      />
                    )}

                  </Item>
                </ImageListItem>
              )
          )}
        </ImageList>
      </Gallery>
    );
  } else {
    return null;
  }
}
