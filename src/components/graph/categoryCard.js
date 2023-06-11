import PropTypes from 'prop-types';
import React from 'react';

import { GraphCardWrapper } from '.';
import { ColorPaper, ColorPaperTitle } from '../colorPaper';

export default function CategoryCard({ color, nodeData }) {
  /* console.log(nodeData); */

  return (
    <GraphCardWrapper>
      <ColorPaper color={color} invert>
        <ColorPaperTitle color={color} title={nodeData.data.Name} invert />
      </ColorPaper>
    </GraphCardWrapper>
  );
}

CategoryCard.propTypes = {
  nodeData: PropTypes.object.isRequired
};
