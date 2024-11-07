import React, { useEffect, useRef } from "react";

const PlainGradientAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const colors = ["#004643", "#001e1d", "#0a4a3b", "#1a2e2b"];

    let time = 0; // Track time to make the movement oscillate

    const render = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate new gradient position with sinusoidal movement for infinite oscillation
      const gradientX = Math.sin(time) * canvas.width * 0.25;
      const gradientY = Math.cos(time) * canvas.height * 0.25;

      // Draw animated radial gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + gradientX,
        canvas.height / 2 + gradientY,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 1.5
      );

      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(0.75, colors[2]);
      gradient.addColorStop(1, colors[3]);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Increment time to create continuous animation
      time += 0.02; // Adjust for speed of oscillation

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full fixed inset-0 -z-10 transform-gpu blur-3xl overflow-hidden"
    />
  );
};

export default PlainGradientAnimation;
