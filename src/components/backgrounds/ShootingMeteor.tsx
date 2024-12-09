import React, { useEffect, useRef } from "react";

const ShootingMeteor: React.FC<{ number?: number }> = ({ number = 20 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate meteor data
    const meteors = Array.from({ length: number }, () => ({
      x: Math.random() * canvas.width,
      y: (Math.random() * canvas.height) / 2, // Start in the upper half
      length: Math.random() * 50 + 30,
      speedX: Math.random() * 1.5 + 0.5, // Slower horizontal speed
      speedY: Math.random() * 1.5 + 0.5, // Slower vertical speed
      opacity: Math.random() * 0.5 + 0.5,
    }));

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawMeteor = (meteor: (typeof meteors)[0]) => {
      ctx.save();
      ctx.globalAlpha = meteor.opacity;

      // Create gradient for the meteor trail
      const gradient = ctx.createLinearGradient(
        meteor.x,
        meteor.y,
        meteor.x + meteor.length,
        meteor.y + meteor.length
      );
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, "#64748b");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;

      // Draw the meteor
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x + meteor.length, meteor.y + meteor.length);
      ctx.stroke();
      ctx.restore();
    };

    const updateMeteor = (meteor: (typeof meteors)[0]) => {
      meteor.x += meteor.speedX;
      meteor.y += meteor.speedY;

      // Reset meteor if it moves off screen
      if (meteor.x > canvas.width || meteor.y > canvas.height) {
        meteor.x = Math.random() * canvas.width;
        meteor.y = (Math.random() * canvas.height) / 2;
        meteor.length = Math.random() * 50 + 30;
        meteor.speedX = Math.random() * 1.5 + 0.5; // Reset slower speed
        meteor.speedY = Math.random() * 1.5 + 0.5;
        meteor.opacity = Math.random() * 0.5 + 0.5;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      meteors.forEach((meteor) => {
        drawMeteor(meteor);
        updateMeteor(meteor);
      });
      requestAnimationFrame(animate);
    };

    updateCanvasSize();
    animate();

    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [number]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
};

export default ShootingMeteor;
