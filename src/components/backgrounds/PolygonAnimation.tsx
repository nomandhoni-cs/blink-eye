import React, { useEffect, useRef } from "react";

// Define the type for a point in the blob path
type Point = [number, number];

// Function to generate a random blob path
const generateRandomBlobPath = (numPoints: number): Point[] => {
  const path: Point[] = [];
  for (let i = 0; i < numPoints; i++) {
    const x = Math.random() * 100; // Random x coordinate (0 to 100%)
    const y = Math.random() * 100; // Random y coordinate (0 to 100%)
    path.push([x, y]);
  }
  return path;
};

const PolygonAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize(); // Set initial canvas size

    // Generate a random blob path with 16 points
    const blobPath: Point[] = generateRandomBlobPath(10);

    const drawBlob = (scale: number, offsetX: number, offsetY: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);

      ctx.beginPath();
      ctx.moveTo(
        (blobPath[0][0] / 100) * canvas.width,
        (blobPath[0][1] / 100) * canvas.height
      );
      blobPath.forEach(([x, y]) => {
        ctx.lineTo((x / 100) * canvas.width, (y / 100) * canvas.height);
      });
      ctx.closePath();

      // Apply gradient
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#FE4C55");
      gradient.addColorStop(1, "#FEF4E2");
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;
      let time = 0;

      const animateBlob = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Adjust these values to slow down the animation
        const scaleFactor = 0.5;
        const offsetRange = 50;
        const timeSpeed = 0.01; // Slower animation

        // Scale and offset calculations
        scale = 1 + Math.sin(time) * scaleFactor;
        offsetX = Math.sin(time * 0.2) * offsetRange;
        offsetY = Math.cos(time * 0.2) * offsetRange;
        time += timeSpeed;

        drawBlob(scale, offsetX, offsetY);
        requestAnimationFrame(animateBlob);
      };

      animateBlob();
    };

    animate();

    // Resize canvas on window resize
    const handleResize = () => {
      updateCanvasSize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      aria-hidden="true"
    />
  );
};

export default PolygonAnimation;
