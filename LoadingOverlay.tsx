import React, { useEffect, useState } from 'react';

const TIPS = [
  "Gemini is dreaming up your world...",
  "Painting the scenery...",
  "Rolling for initiative...",
  "Constructing narrative threads...",
  "Summoning NPCs..."
];

export const LoadingOverlay: React.FC = () => {
  const [tip, setTip] = useState(TIPS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void-900/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-t-4 border-mystic-purple rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-4 border-mystic-teal rounded-full animate-spin reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-mystic-teal to-mystic-purple animate-pulse">
        {tip}
      </h3>
    </div>
  );
};