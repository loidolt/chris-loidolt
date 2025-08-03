import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

export default function ColorPaperTitle({ color, title, invert }) {
  const [fontSize, setFontSize] = useState('1em');
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setFontSize(`${Math.min(100, width * 0.06)}px`); // Adjust as needed
      }
    });
    resizeObserver.observe(container);
    return () => resizeObserver.unobserve(container);
  }, []);

  const handleArray = (title) => {
    if (Array.isArray(title)) {
      return title.join('|');
    }
    return title;
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%' }}>
      <Typography
        variant="h2"
        sx={{
          position: 'absolute',
          bottom: -6,
          right: 12,
          color: invert ? color.paperBackground : color.main,
          fontSize: fontSize,
          zIndex: 0
        }}>
        {handleArray(title)}
      </Typography>
    </Box>
  );
}
