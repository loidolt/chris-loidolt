import React from "react";
import { navigate, Link } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import { toKebabCase } from "../utils";

export default function PostCard({
  title,
  date,
  path,
  coverImage,
  excerpt,
  tags,
}) {
  return (
    <Card
      sx={{
        backgroundColor: "#1e1e1e",
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.43)",
        borderRadius: "20px",
        "&:hover": {
          boxShadow: "0 15px 35px 0 rgba(0, 0, 0, 0.41)",
          transition: "all 0.55s ease-in-out",
        },
      }}
    >
      <Link
        to={path}
        style={{ color: "inherit", textDecoration: "inherit" }}
      >
        {coverImage && (
          <GatsbyImage
            sx={{
              height: "100%",
            }}
            image={coverImage.childImageSharp.gatsbyImageData}
            alt={title + "Featured Image"}
            style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          />
        )}
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            sx={{
              color: "#c6c6c6",
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            component="p"
            sx={{
              color: "#c6c6c6",
            }}
          >
            {excerpt}
          </Typography>
          <Typography
            variant="subtitle1"
            component="p"
            sx={{
              color: "#a9a9b3",
              float: "right",
            }}
          >
            {date}
          </Typography>
        </CardContent>
      </Link>
      <Divider light sx={{marginTop: 1}} />
      <CardActions>
        {tags.map((tag) => (
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
