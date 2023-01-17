import { window } from 'browser-monads';
import { useEffect, useState } from 'react';

//npm i browser-monads

export default function useWindowSize() {
  const [windowWidth, setWindowWidth] = useState(null);
  const [windowHeight, setWindowHeight] = useState(null);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    windowWidth: windowWidth,
    windowHeight: windowHeight,
  };
}
