interface AnimatedGradientBackgroundProps {
  position?: "top" | "bottom";
  className?: string;
  fromColor?: string;
  toColor?: string;
  opacity?: number;
  animationDuration?: number;
}

export default function AnimatedGradientBackground({
  position = "top",
  className = "",
  fromColor = "#ff80b5",
  toColor = "#9089fc",
  opacity = 0.3,
  animationDuration = 20,
}: AnimatedGradientBackgroundProps) {
  // Define position-specific styles
  const positionStyles = {
    top: {
      containerClass:
        "absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80",
      innerClass:
        "relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]",
    },
    bottom: {
      containerClass:
        "absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]",
      innerClass:
        "relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]",
    },
  };

  const selectedPosition = positionStyles[position];

  return (
    <div
      aria-hidden="true"
      className={`${selectedPosition.containerClass} ${className}`}
    >
      <div
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          backgroundImage: `linear-gradient(to top right, ${fromColor}, ${toColor})`,
          opacity: opacity,
          animation: `gradient-shift ${animationDuration}s ease infinite, 
                     blob-rotate ${animationDuration * 1.5}s ease infinite, 
                     blob-scale ${
                       animationDuration * 0.75
                     }s ease-in-out infinite alternate`,
        }}
        className={`${selectedPosition.innerClass} bg-gradient-to-tr animate-gradient`}
      />
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
            background-size: 100% 100%;
          }
          25% {
            background-position: 50% 100%;
            background-size: 150% 150%;
          }
          50% {
            background-position: 100% 50%;
            background-size: 200% 200%;
          }
          75% {
            background-position: 50% 0%;
            background-size: 150% 150%;
          }
          100% {
            background-position: 0% 50%;
            background-size: 100% 100%;
          }
        }

        @keyframes blob-rotate {
          0% {
            transform: rotate(0deg);
          }
          33% {
            transform: rotate(
              ${Math.random() > 0.5 ? "+" : "-"}${5 + Math.floor(Math.random() * 10)}deg
            );
          }
          66% {
            transform: rotate(
              ${Math.random() > 0.5 ? "+" : "-"}${5 + Math.floor(Math.random() * 15)}deg
            );
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes blob-scale {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
