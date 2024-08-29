"use client"
import React, { useEffect, useState } from 'react';

const AnimatedPolygon: React.FC = () => {
  const [keyframes, setKeyframes] = useState('');

  useEffect(() => {
    const generateRandomKeyframes = () => {
      const randomPosition = () => `${Math.random() * 100}% ${Math.random() * 100}%`;
      const randomTransform = () => `translate(${Math.random() * 100 - 50}%, ${Math.random() * 100 - 50}%) rotate(${Math.random() * 360}deg)`;
      const randomScale = () => `scale(${1 + Math.random() * 1.5})`;

      return `
        @keyframes movePolygon {
          0% { transform: ${randomTransform()}; }
          25% { transform: ${randomTransform()}; }
          50% { transform: ${randomTransform()}; }
          75% { transform: ${randomTransform()}; }
          100% { transform: ${randomTransform()}; }
        }

        @keyframes expandShrink {
          0%, 100% { transform: ${randomScale()}; }
          50% { transform: ${randomScale()}; }
        }
      `;
    };

    setKeyframes(generateRandomKeyframes());
  }, []);

  return (
    <div className="relative isolate">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#FE4C55] to-[#FEF4E2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            animation: 'movePolygon 10s ease-in-out infinite, expandShrink 8s ease-in-out infinite',
          }}
        />
      </div>
      <style>{keyframes}</style>
    </div>
  );
};

const PolygonAnimation = () => (
  <AnimatedPolygon />
);

export default PolygonAnimation;
