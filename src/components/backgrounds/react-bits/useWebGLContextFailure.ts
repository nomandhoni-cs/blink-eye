import { useEffect, useRef, type RefObject } from "react";

export function useWebGLContextFailure(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onRendererError?: (reason: string) => void,
) {
  const reported = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (reported.current) return;
      reported.current = true;
      const reason = "WebGL context was lost while rendering.";
      console.error(`[WebGL] ${reason}`);
      onRendererError?.(reason);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [canvasRef, onRendererError]);
}
