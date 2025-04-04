"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsRight, Maximize, RefreshCw } from "lucide-react";
import GradientBackground from "./GradientBackground";

export default function TimerDemo() {
  const [timeLeft, setTimeLeft] = useState(20);
  const [timeCount, setTimeCount] = useState(0);
  const [isBreakComplete, setIsBreakComplete] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  //   const [isUsingStrictMode, setIsUsingStrictMode] = useState(false);
  const [fullScreenProgress, setFullScreenProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reminderText =
    "Pause! Look into the distance, and best if you walk a bit.";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let screenTimeCounter: NodeJS.Timeout;

    if (timeLeft > 0 && !isBreakComplete) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setProgressPercentage(((20 - timeLeft + 1) / 20) * 100);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBreakComplete(true);
    }

    // Screen time counter
    screenTimeCounter = setInterval(() => {
      setTimeCount((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(screenTimeCounter);
    };
  }, [timeLeft, isBreakComplete]);

  // Scroll-based animation
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the section is visible
      const visibleHeight =
        Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const sectionHeight = rect.height;

      // Calculate progress (0 to 1)
      let progress = visibleHeight / sectionHeight;

      // Enhance the effect by making it more dramatic
      progress = Math.max(0, Math.min(1, progress * 1.5));

      setFullScreenProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial calculations
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Full screen functionality
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(
        document.fullscreenElement !== null ||
          // @ts-ignore - These prefixed properties are not in the TypeScript DOM definitions
          document.webkitFullscreenElement !== null ||
          // @ts-ignore
          document.mozFullScreenElement !== null ||
          // @ts-ignore
          document.msFullscreenElement !== null
      );
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, []);

  // Mock function for appWindow.close()
  const closeWindow = () => {
    console.log("Window closed");
    setTimeLeft(0);
    setIsBreakComplete(true);
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // Reset timer function
  const resetTimer = () => {
    setTimeLeft(20);
    setProgressPercentage(0);
    setIsBreakComplete(false);
  };

  // Calculate dynamic styles based on scroll progress
  const containerStyle = {
    transform: `scale(${1 + fullScreenProgress * 0.2})`,
    transition: "transform 0.3s ease-out",
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 flex justify-center items-center transition-all duration-300 hidden sm:block"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* 16:9 aspect ratio container */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div
            ref={containerRef}
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
            style={isFullScreen ? undefined : containerStyle}
          >
            {/* Particle background */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
              <GradientBackground
                position="top"
                fromColor="#FF4C55"
                toColor="#9089fc"
              />
            </div>

            {/* Content with glass effect */}
            <div className="relative z-10 p-8 rounded-3xl border-4 border-white/20 border-opacity-5 h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center w-full">
                {isBreakComplete ? (
                  <div className="text-4xl md:text-5xl font-heading text-center mb-6 ">
                    Congrats, You took the break!
                  </div>
                ) : (
                  <>
                    <div className="relative w-40 h-40 md:w-52 md:h-52 mb-6">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 110 110"
                      >
                        {/* Background Circle */}
                        <circle
                          className="text-gray-300/30"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="50"
                          cx="55"
                          cy="55"
                        />
                        {/* Progress Circle */}
                        <circle
                          className=""
                          strokeWidth="8"
                          strokeDasharray={314.16}
                          strokeDashoffset={
                            314.16 * ((100 - progressPercentage) / 100)
                          }
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="50"
                          cx="55"
                          cy="55"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[70px] md:text-[90px] font-semibold text-center">
                          {timeLeft}
                        </span>
                      </div>
                    </div>

                    <div className="text-xl md:text-2xl lg:text-3xl font-heading text-center mb-4">
                      {reminderText ||
                        "Pause, look into the distance, and best if walk a bit."}
                    </div>

                    <div className="flex justify-center items-center space-x-4 mb-6">
                      <CurrentTime />
                      <div className="w-1 h-6 opacity-20 bg-white" />
                      <ScreenOnTime timeCount={timeCount} />
                    </div>

                    {/* {!isUsingStrictMode && (  */}
                    <Button
                      onClick={closeWindow}
                      variant="outline"
                      className="opacity-80 backdrop-blur-2xl rounded-full shadow-2xl text-muted-foreground transition-colors border border-white/20 hover:bg-white/20"
                    >
                      <ChevronsRight className="w-4 h-4 mr-1" />
                      Skip this time
                    </Button>
                    {/* )} */}
                  </>
                )}

                {/* Control buttons in bottom right corner */}
                <div className="absolute bottom-8 right-8 flex space-x-3">
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="icon"
                    className="opacity-80 backdrop-blur-2xl rounded-full shadow-lg transition-colors border border-white/20 hover:bg-white/20 h-12 w-12"
                    title="Reset timer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={toggleFullScreen}
                    variant="outline"
                    size="icon"
                    className="opacity-80 backdrop-blur-2xl rounded-full shadow-lg transition-colors border border-white/20 hover:bg-white/20 h-12 w-12"
                    title={
                      isFullScreen ? "Exit full screen" : "Enter full screen"
                    }
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <GradientBackground
              position="bottom"
              fromColor="#FF4C55"
              toColor="#9089fc"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-md font-medium text-muted-foreground">
      Current Time: {time}
    </div>
  );
}

function ScreenOnTime({ timeCount }: { timeCount: number }) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="text-md font-medium text-muted-foreground">
      Screen on Time: {formatTime(timeCount)}
    </div>
  );
}
