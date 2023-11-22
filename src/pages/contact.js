import React from 'react';

import { ColorPaper, ColorPaperContent, ColorPaperTitle } from '../components/colorPaper';
import { ContactForm } from '../components/contact';
import { Layout, Seo } from '../components/layout';
import { colors } from '../theme/pastelColors';

export default function Contact() {
  return (
    <Layout color={colors[0]}>
      <ColorPaper invert color={colors[0]}>
        <ColorPaperTitle invert title={'Contact'} color={colors[0]} />
        <ColorPaperContent>
          <ContactForm color={colors[0]} />
        </ColorPaperContent>
      </ColorPaper>
    </Layout>
  );
}

export const Head = () => <Seo title="Contact" />;
