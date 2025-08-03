import PropTypes from 'prop-types';
import React from 'react';

import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../colorPaper';
import { GraphCardWrapper } from '../graph';
import ContactForm from './contactForm';

export default function ContactCard({ color }) {
  /* console.log(nodeData); */

  return (
    <GraphCardWrapper>
      <ColorPaper color={color} invert>
        <ColorPaperTitle color={color} title={'Contact'} invert />
        <ColorPaperContent>
          <ContactForm color={color} />
        </ColorPaperContent>
      </ColorPaper>
    </GraphCardWrapper>
  );
}

ContactCard.propTypes = {
  color: PropTypes.object.isRequired
};
