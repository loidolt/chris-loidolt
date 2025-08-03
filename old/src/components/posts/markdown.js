/* eslint-disable react/no-children-prop */
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LinkRenderer = (props) => {
  //console.log(props);
  return (
    <div>
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
        {props.href}
      </a>
    </div>
  );
};

LinkRenderer.propTypes = {
  href: PropTypes.string.isRequired
};

export default function Markdown({ children }) {
  const renderers = {
    a: LinkRenderer
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <ReactMarkdown
        children={children}
        remarkPlugins={[remarkGfm]}
        components={renderers}
        linkTarget="_blank"
      />
    </Box>
  );
}

Markdown.propTypes = {
  children: PropTypes.node.isRequired
};
