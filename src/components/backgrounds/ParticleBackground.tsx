import { useEffect, useRef } from "react";

// Types and Interfaces
interface Vector2D {
  x: number;
  y: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface ParticleConfig {
  size: number;
  baseVelocity: number;
  color: string;
  alpha: number;
}

interface ConnectionConfig {
  maxDistance: number;
  lineWidth: number;
  color: string;
}

interface IParticle {
  x: number;
  y: number;
  size: number;
  velocity: Vector2D;
  update: (bounds: CanvasSize) => void;
  draw: (ctx: CanvasRenderingContext2D, config: ParticleConfig) => void;
}

class Particle implements IParticle {
  x: number;
  y: number;
  size: number;
  velocity: Vector2D;
  private baseVelocity: number;

  constructor(bounds: CanvasSize, config: ParticleConfig) {
    this.x = Math.random() * bounds.width;
    this.y = Math.random() * bounds.height;
    this.size = config.size;
    this.baseVelocity = config.baseVelocity;
    this.velocity = {
      x: (Math.random() - 0.5) * this.baseVelocity,
      y: (Math.random() - 0.5) * this.baseVelocity,
    };
  }

  update(bounds: CanvasSize): void {
    if (this.x > bounds.width || this.x < 0) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.y > bounds.height || this.y < 0) {
      this.velocity.y = -this.velocity.y;
    }
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw(ctx: CanvasRenderingContext2D, config: ParticleConfig): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = config.color;
    ctx.globalAlpha = config.alpha;
    ctx.fill();
  }
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration objects
    const canvasSize: CanvasSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const particleConfig: ParticleConfig = {
      size: 1.5,
      baseVelocity: 0.5,
      color: "#888",
      alpha: 0.7,
    };

    const connectionConfig: ConnectionConfig = {
      maxDistance: 120,
      lineWidth: 0.5,
      color: "#888",
    };

    // Initialize canvas
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const particlesArray: IParticle[] = [];
    const numParticles = Math.floor(
      (canvasSize.width * canvasSize.height) / 10000
    );

    // Utility functions
    const createParticles = (count: number): void => {
      for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle(canvasSize, particleConfig));
      }
    };

    const calculateDistance = (p1: IParticle, p2: IParticle): number => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const drawConnection = (
      ctx: CanvasRenderingContext2D,
      p1: IParticle,
      p2: IParticle,
      distance: number,
      config: ConnectionConfig
    ): void => {
      ctx.beginPath();
      ctx.strokeStyle = config.color;
      ctx.globalAlpha = (config.maxDistance - distance) / config.maxDistance;
      ctx.lineWidth = config.lineWidth;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    const connectParticles = (
      ctx: CanvasRenderingContext2D,
      particles: IParticle[],
      config: ConnectionConfig
    ): void => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const distance = calculateDistance(particles[a], particles[b]);
          if (distance < config.maxDistance) {
            drawConnection(ctx, particles[a], particles[b], distance, config);
          }
        }
      }
    };

    const animate = (): void => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      particlesArray.forEach((particle) => {
        particle.update(canvasSize);
        particle.draw(ctx, particleConfig);
      });

      connectParticles(ctx, particlesArray, connectionConfig);
      requestAnimationFrame(animate);
    };

    const resizeCanvas = (): void => {
      canvasSize.width = window.innerWidth;
      canvasSize.height = window.innerHeight;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      particlesArray.length = 0;
      createParticles(numParticles);
    };

    // Initialize and start animation
    createParticles(numParticles);
    animate();

    // Event listeners
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div
      id="particle-canvas"
      className="absolute top-0 left-0 w-full h-full z-0"
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 transform-gpu overflow-hidden"
        aria-hidden="true"
      />
    </div>
  );
};

export default ParticleBackground;
