import React from 'react';
import { Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

export default function PostItem({ hit, components }) {

  let image
  if (hit.Cover_Image.localFiles) {
    image = getImage(hit.Cover_Image.localFiles[0].childImageSharp.gatsbyImageData)
  }

  return (
    <Link to={hit.Path} className="aa-ItemLink">
      <div className="aa-ItemContent">
        {image &&
          <div className="aa-ItemIcon aa-ItemIcon--picture aa-ItemIcon--alignTop">
            <GatsbyImage
              image={image}
              alt={hit.Title + " Featured Image"}
            />
          </div>
        }
        <div className="aa-ItemContentBody">
          <div className="aa-ItemTitle">
            <components.Highlight hit={hit} attribute="Title" />
          </div>
          <div className="aa-ItemContentDescription">
            {hit.Date}
          </div>
        </div>
      </div>
    </Link>
  );
}