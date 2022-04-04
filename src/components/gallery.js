import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { GatsbyImage } from "gatsby-plugin-image";
import { SRLWrapper } from "simple-react-lightbox";

class Gallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { photos } = this.props;

    if (this.props.photos.length > 1) {
      return (
        <Box
          sx={{
            marginTop: 10,
            flexGrow: 1,
          }}
        >
          <SRLWrapper>
            <Grid container spacing={3}>
              {photos.map(
                (image, index) =>
                  image.childImageSharp.gatsbyImageData && (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Paper
                        sx={{
                          padding: 0,
                          textAlign: "center",
                          backgroundColor: "transparent",
                          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.43)",
                          "&:hover": {
                            boxShadow: "0 15px 35px 0 rgba(0, 0, 0, 0.41)",
                            transition: "all 0.55s ease-in-out",
                          },
                        }}
                      >
                        <GatsbyImage
                          image={image.childImageSharp.gatsbyImageData}
                          alt={this.props.postName + " " + index}
                          style={{ borderRadius: "10px", cursor: "pointer", }}
                        />
                      </Paper>
                    </Grid>
                  )
              )}
            </Grid>
          </SRLWrapper>
        </Box>
      );
    } else {
      return null;
    }
  }
}

export default Gallery;
