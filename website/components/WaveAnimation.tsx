"use client";
import { useRef, useEffect } from "react";

const wavePaths: string[] = [
  //"M0 826L35.5 812.5C71 799 142 772 213.2 766.8C284.3 761.7 355.7 778.3 426.8 774.2C498 770 569 745 640 716.8C711 688.7 782 657.3 853.2 665C924.3 672.7 995.7 719.3 1066.8 715.3C1138 711.3 1209 656.7 1280 632C1351 607.3 1422 612.7 1493.2 635C1564.3 657.3 1635.7 696.7 1706.8 712C1778 727.3 1849 718.7 1884.5 714.3L1920 710L1920 1081L0 1081Z",
  "M0 782L35.5 773.5C71 765 142 748 213.2 743.7C284.3 739.3 355.7 747.7 426.8 749C498 750.3 569 744.7 640 758C711 771.3 782 803.7 853.2 809.7C924.3 815.7 995.7 795.3 1066.8 802C1138 808.7 1209 842.3 1280 855.7C1351 869 1422 862 1493.2 840C1564.3 818 1635.7 781 1706.8 785.3C1778 789.7 1849 835.3 1884.5 858.2L1920 881L1920 1081L0 1081Z",
  "M0 967L35.5 957.5C71 948 142 929 213.2 923.7C284.3 918.3 355.7 926.7 426.8 934.7C498 942.7 569 950.3 640 938C711 925.7 782 893.3 853.2 888.2C924.3 883 995.7 905 1066.8 922.5C1138 940 1209 953 1280 936.7C1351 920.3 1422 874.7 1493.2 861.5C1564.3 848.3 1635.7 867.7 1706.8 881C1778 894.3 1849 901.7 1884.5 905.3L1920 909L1920 1081L0 1081Z",
  "M0 906L35.5 926C71 946 142 986 213.2 984.3C284.3 982.7 355.7 939.3 426.8 918C498 896.7 569 897.3 640 915.3C711 933.3 782 968.7 853.2 985.8C924.3 1003 995.7 1002 1066.8 994.2C1138 986.3 1209 971.7 1280 963.3C1351 955 1422 953 1493.2 958.5C1564.3 964 1635.7 977 1706.8 981.2C1778 985.3 1849 980.7 1884.5 978.3L1920 976L1920 1081L0 1081Z",
];

const colors: string[] = [
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
];

const WaveAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;

    const drawWave = (path: string, offsetY: number, color: string) => {
      const path2D = new Path2D(path);
      context.save();
      context.translate(0, Math.sin(offsetY + frame * 0.05) * 5);
      context.fillStyle = color;
      context.fill(path2D);
      context.restore();
    };

    const animate = () => {
      if (!canvas || !context) return;
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      wavePaths.forEach((path, index) => {
        drawWave(path, index * 20, colors[index % colors.length]);
      });
      frame += 1;
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-screen w-screen inset-10 -z-20 overflow-hidden"
    />
  );
};

export default WaveAnimation;
