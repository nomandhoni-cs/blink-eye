import { useEffect, useRef } from "react";

// Canvas Types
interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasGradientStop {
  position: number;
  color: string;
}

interface CanvasContextConfig {
  fillStyle: string | CanvasGradient;
  strokeStyle?: string;
  lineWidth?: number;
  globalAlpha?: number;
}

interface CanvasDrawConfig extends CanvasContextConfig {
  size: number;
  x: number;
  y: number;
}

type Shape = "circle" | "square" | "triangle" | "hexa" | "img";

interface CanvasShapesProps {
  size?: number;
  speed?: number;
  numberOfItems?: number;
  shape?: Shape;
  color?: string;
  image?: string;
}

// Particle interface with specific canvas methods
interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  Color: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
  update: (bounds: CanvasSize) => void;
}

const CanvasShapes: React.FC<CanvasShapesProps> = ({
  size = 10,
  speed = 10,
  numberOfItems = 150,
  shape = "circle",
  color,
  image,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasSize: CanvasSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const particles: IParticle[] = [];

    // Configure canvas context with type safety
    const configureContext = (
      ctx: CanvasRenderingContext2D,
      config: CanvasContextConfig
    ): void => {
      ctx.fillStyle = config.fillStyle;
      if (config.strokeStyle) ctx.strokeStyle = config.strokeStyle;
      if (config.lineWidth) ctx.lineWidth = config.lineWidth;
      if (config.globalAlpha) ctx.globalAlpha = config.globalAlpha;
    };

    const getRandomColor = (): string => {
      if (color) return color;
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    };

    // Create gradient with type safety
    const createGradient = (
      ctx: CanvasRenderingContext2D,
      size: CanvasSize
    ): CanvasGradient => {
      const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);

      // Use the new colors near #FF9DA2 and #E061B5
      const gradientStops: CanvasGradientStop[] = [
        { position: 0, color: "#FF9DA2" }, // Soft pinkish tone
        { position: 0.25, color: "#FF7A9D" }, // A bit darker pink
        { position: 0.5, color: "#E061B5" }, // Vivid magenta
        { position: 0.75, color: "#9E4C8F" }, // Deeper magenta
        { position: 1, color: "#6B365B" }, // Darker purplish tone
      ];

      // Add color stops to the gradient
      gradientStops.forEach((stop) => {
        gradient.addColorStop(stop.position, stop.color);
      });

      return gradient;
    };

    class Particle implements IParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      Color: string;

      constructor(x?: number, y?: number) {
        this.x = x ?? canvasSize.width * Math.random();
        this.y = y ?? canvasSize.height * Math.random();
        this.vx = speed * Math.random() - 2;
        this.vy = speed * Math.random() - 2;
        this.Color = getRandomColor();
      }

      private drawCircle(
        ctx: CanvasRenderingContext2D,
        config: CanvasDrawConfig
      ): void {
        ctx.beginPath();
        ctx.arc(config.x, config.y, config.size, 0, 2 * Math.PI, false);
        ctx.fill();
      }

      private drawSquare(
        ctx: CanvasRenderingContext2D,
        config: CanvasDrawConfig
      ): void {
        ctx.fillRect(config.x, config.y, config.size, config.size);
      }

      private drawTriangle(
        ctx: CanvasRenderingContext2D,
        config: CanvasDrawConfig
      ): void {
        ctx.beginPath();
        ctx.moveTo(config.x, config.y);
        ctx.lineTo(config.x + config.size, config.y + config.size);
        ctx.lineTo(config.x + config.size, config.y - config.size);
        ctx.closePath();
        ctx.fill();
      }

      private drawHexagon(
        ctx: CanvasRenderingContext2D,
        config: CanvasDrawConfig
      ): void {
        ctx.beginPath();
        ctx.moveTo(
          config.x + config.size * Math.cos(0),
          config.y + config.size * Math.sin(0)
        );
        for (let side = 0; side < 7; side++) {
          ctx.lineTo(
            config.x + config.size * Math.cos((side * 2 * Math.PI) / 6),
            config.y + config.size * Math.sin((side * 2 * Math.PI) / 6)
          );
        }
        ctx.fill();
      }

      private drawImage(
        ctx: CanvasRenderingContext2D,
        config: CanvasDrawConfig
      ): void {
        if (image) {
          const img = new Image();
          img.src = image;
          img.onload = () =>
            ctx.drawImage(img, config.x, config.y, config.size, config.size);
        }
      }

      draw(ctx: CanvasRenderingContext2D): void {
        const drawConfig: CanvasDrawConfig = {
          x: this.x,
          y: this.y,
          size,
          fillStyle: this.Color,
        };

        configureContext(ctx, drawConfig);

        switch (shape) {
          case "circle":
            this.drawCircle(ctx, drawConfig);
            break;
          case "square":
            this.drawSquare(ctx, drawConfig);
            break;
          case "triangle":
            this.drawTriangle(ctx, drawConfig);
            break;
          case "hexa":
            this.drawHexagon(ctx, drawConfig);
            break;
          case "img":
            this.drawImage(ctx, drawConfig);
            break;
        }
      }

      update(bounds: CanvasSize): void {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > bounds.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > bounds.height) this.vy = -this.vy;
      }
    }

    // Generate particles
    for (let i = 0; i < Math.min(numberOfItems, 250); i++) {
      particles.push(new Particle());
    }

    const drawCircle = (event: MouseEvent): void => {
      const cursorX = event.pageX;
      const cursorY = event.pageY;
      particles.unshift(new Particle(cursorX, cursorY));
      if (particles.length > 500) particles.pop();
    };

    const loop = (): void => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Apply gradient background
      const gradient = createGradient(ctx, canvasSize);
      configureContext(ctx, { fillStyle: gradient });
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      particles.forEach((particle) => {
        particle.update(canvasSize);
        particle.draw(ctx);
      });

      requestAnimationFrame(loop);
    };

    loop();

    canvas.addEventListener("click", drawCircle);
    canvas.addEventListener("mousemove", drawCircle);

    const handleResize = (): void => {
      if (canvas) {
        canvasSize.width = window.innerWidth;
        canvasSize.height = window.innerHeight;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("click", drawCircle);
      canvas.removeEventListener("mousemove", drawCircle);
    };
  }, [color, image, numberOfItems, shape, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-auto"
    />
  );
};

export default CanvasShapes;
