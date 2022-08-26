import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import useWindowSize from "../hooks/useGatsbyWindowSize";

export default function GalleryGrid({ photos }) {
  const [open, setOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);

  const { windowWidth } = useWindowSize();

  const handleClickOpen = (value) => {
    setSelectedImage(value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
      <>
        <ImageList variant="masonry" cols={setColumns(windowWidth)} gap={12}>
          {photos.map(
            (image, index) =>
              <ImageListItem key={index} onClick={() => handleClickOpen(image)}>
                <GatsbyImage
                  image={
                    image.childImageSharp.gatsbyImageData
                  }
                  alt={image.name}
                  style={{
                    cursor: 'pointer',
                    objectFit: 'cover',
                    width: '100%',
                    maxHeight: '100%',
                    borderRadius: "10px",
                  }}
                />
              </ImageListItem>
          )}
        </ImageList>
        {selectedImage &&
          <Dialog onClose={handleClose} open={open}>
            <GatsbyImage
              image={
                selectedImage.childImageSharp.gatsbyImageData
              }
              alt={selectedImage.name}
              style={{
                objectFit: 'cover',
                width: '100%',
                maxHeight: '100%',
                borderRadius: "10px",
              }}
            />
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 2,
                top: 2,
                backgroundColor: "rgba(0, 0, 0, 0.5)"
              }}
            >
              <CloseIcon />
            </IconButton>
          </Dialog>
        }
      </>
    );
  } else {
    return null;
  }
}
