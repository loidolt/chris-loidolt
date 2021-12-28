import React from "react";
import PropTypes from "prop-types";
import { navigate, Link } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import { toKebabCase } from "../helpers";

export default function PostCard(props) {
  return (
    <Card
      sx={{
        backgroundColor: "#1e1e1e",
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.43)",
        "&:hover": {
          boxShadow: "0 15px 35px 0 rgba(0, 0, 0, 0.41)",
          transition: "all 0.55s ease-in-out",
        },
      }}
    >
      <Link
        to={props.path}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        {props.coverImage && (
          <GatsbyImage
            sx={{
              height: "100%",
            }}
            image={props.coverImage.childImageSharp.gatsbyImageData}
            alt={props.title + "Featured Image"}
            style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
          />
        )}
        <CardContent>
          <Typography
            variant="subtitle1"
            component="p"
            sx={{
              color: "#a9a9b3",
              float: "right",
            }}
          >
            {props.date}
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            sx={{
              color: "#c6c6c6",
              fontWeight: 700,
            }}
          >
            {props.title}
          </Typography>

          <Typography
            variant="body2"
            component="p"
            sx={{
              color: "#c6c6c6",
            }}
          >
            {props.excerpt}
          </Typography>
        </CardContent>
      </Link>
      <Divider light />
      <CardActions>
        {props.tags.map((tag) => (
          <Chip
            key={tag}
            label={"#" + tag}
            variant="outlined"
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.38)",
              backgroundColor: "#2c2c2c",
              "&:hover": {
                backgroundColor: "#373737",
              },
            }}
            onClick={() => navigate(`/tag/${toKebabCase(tag)}/`)}
          />
        ))}
      </CardActions>
    </Card>
  );
}

PostCard.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  path: PropTypes.string,
  coverImage: PropTypes.object,
  excerpt: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
};
