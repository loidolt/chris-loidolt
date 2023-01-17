import { Close } from '@mui/icons-material';
import { Dialog, IconButton, ImageList, ImageListItem } from '@mui/material';
import { GatsbyImage } from 'gatsby-plugin-image';
import React from 'react';

import { useWindowSize } from '../../hooks';

export default function GalleryGrid({ photos }) {
  const [open, setOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  const { windowWidth } = useWindowSize();

  const handleClickOpen = value => {
    setSelectedImage(value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const setColumns = width => {
    if (width < 700) {
      return 1;
    } else if (width < 1000) {
      return 2;
    } else {
      return 4;
    }
  };

  if (photos.length > 1) {
    return (
      <>
        <ImageList cols={setColumns(windowWidth)} gap={12}>
          {photos.map((image, index) => (
            <ImageListItem key={index} onClick={() => handleClickOpen(image)}>
              <GatsbyImage
                image={image.childImageSharp.gatsbyImageData}
                alt={image.name}
                style={{
                  cursor: 'pointer',
                  objectFit: 'cover',
                  width: '100%',
                  maxHeight: '100%',
                  borderRadius: '10px',
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
        {selectedImage && (
          <Dialog onClose={handleClose} open={open}>
            <GatsbyImage
              image={selectedImage.childImageSharp.gatsbyImageData}
              alt={selectedImage.name}
              style={{
                objectFit: 'cover',
                width: '100%',
                maxHeight: '100%',
                borderRadius: '10px',
              }}
            />
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 2,
                top: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <Close />
            </IconButton>
          </Dialog>
        )}
      </>
    );
  } else {
    return null;
  }
}
