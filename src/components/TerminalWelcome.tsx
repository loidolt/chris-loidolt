import { useState, useEffect } from 'react';

export default function TerminalWelcome() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `$ cat welcome.txt

Design & Engineering Portfolio
Showcasing projects in 3D printing, woodworking, and software

Navigate using the menu above or explore [projects]`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8">
      <pre className="text-terminal-text text-sm whitespace-pre-wrap leading-relaxed">
        {displayedText}
        <span className="terminal-cursor text-terminal-green">_</span>
      </pre>
    </div>
  );
}
