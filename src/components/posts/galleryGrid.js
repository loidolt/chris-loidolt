import { ArrowBack, ArrowForward, Close } from '@mui/icons-material';
import { Dialog, IconButton, ImageList, ImageListItem, Stack } from '@mui/material';
import { GatsbyImage } from 'gatsby-plugin-image';
import PropTypes from 'prop-types';
import React from 'react';

import { useWindowSize } from '../../hooks';

export default function GalleryGrid({ photos }) {
  const [open, setOpen] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(null);

  const { windowWidth } = useWindowSize();

  const handleClickOpen = (index) => {
    setSelectedImageIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    setSelectedImageIndex((selectedImageIndex + 1) % photos.length);
  };

  const handlePrev = () => {
    setSelectedImageIndex((selectedImageIndex + photos.length - 1) % photos.length);
  };

  const setColumns = (width) => {
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
            <ImageListItem key={index} onClick={() => handleClickOpen(index)}>
              <GatsbyImage
                image={image.childImageSharp.gatsbyImageData}
                alt={image.name}
                style={{
                  cursor: 'pointer',
                  borderRadius: '10px',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
        {photos[selectedImageIndex] && (
          <Dialog onClose={handleClose} open={open}>
            <GatsbyImage
              image={photos[selectedImageIndex].childImageSharp.gatsbyImageData}
              alt={photos[selectedImageIndex].name}
              style={{
                borderRadius: '10px',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            <Stack
              direction="row"
              spacing={2}
              sx={{
                position: 'absolute',
                left: 2,
                top: 2
              }}
            >
              <IconButton
                aria-label="previous"
                onClick={handlePrev}
                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <ArrowBack />
              </IconButton>
              <IconButton
                aria-label="next"
                onClick={handleNext}
                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <ArrowForward />
              </IconButton>
            </Stack>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 2,
                top: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
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

GalleryGrid.propTypes = {
  photos: PropTypes.array.isRequired
};
