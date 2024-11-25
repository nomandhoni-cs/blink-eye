import React, { useEffect, useRef } from "react";

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext("2d");
    if (!c) return;

    const n_stars = 150;
    const colors = [
      "#FE4C55", // Your brand color
      "#FF6363", // A vibrant coral red
      "#FF7A7B", // Lightened pink-red, a bit softer
      "#D94A54", // Slightly darker, more grounded tone
      "#E15761", // Similar hue with a little more saturation
      "#FF8485", // Bright and slightly pastel
      "#C4454A", // A deeper, muted red for contrast
      "#FF9497", // A light, approachable pinkish tone
      "#F3474F", // Bold and punchy, more red-based
      "#FFA3A5", // Soft blush with a hint of warmth
      ...Array(98).fill("#fff"),
    ]; // Stars visible in light and dark

    const randomInt = (max: number, min: number) =>
      Math.floor(Math.random() * (max - min) + min);

    class Star {
      x: number;
      y: number;
      radius: number;
      color: string;
      dy: number;

      constructor(
        x: number = randomInt(0, canvas?.width ?? window.innerWidth),
        y: number = randomInt(0, canvas?.height ?? window.innerHeight),
        radius: number = Math.random() * 1.1,
        color: string = colors[randomInt(0, colors.length)]
      ) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dy = -Math.random() * 0.3;
      }

      draw() {
        // Assert that 'c' is not null
        const context = c as CanvasRenderingContext2D;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.shadowBlur = randomInt(3, 15);
        context.shadowColor = this.color;
        context.strokeStyle = this.color;
        context.fillStyle = "rgba(255, 255, 255, .5)";
        context.fill();
        context.stroke();
        context.closePath();
      }

      update(arrayStars: Star[]) {
        if (this.y - this.radius < 0) this.createNewStar(arrayStars);
        this.y += this.dy;
        this.draw();
      }

      createNewStar(arrayStars: Star[]) {
        const i = arrayStars.indexOf(this);
        arrayStars.splice(i, 1);
        arrayStars.push(new Star());
      }
    }

    let stars: Star[] = [];
    const init = () => {
      for (let i = 0; i < n_stars; i++) {
        stars.push(new Star());
      }
    };
    init();

    const animate = () => {
      requestAnimationFrame(animate);
      c.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => s.update(stars));
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      // Set canvas size with device pixel ratio to avoid blurriness
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Scale the context for retina displays
      c.scale(dpr, dpr);

      stars = [];
      init();
    };

    window.addEventListener("resize", handleResize);

    // Initial resize call
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full fixed inset-0 -z-10 overflow-hidden"
    />
  );
};

export default StarryBackground;
