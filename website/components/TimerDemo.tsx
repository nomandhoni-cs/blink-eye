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

      const visibleHeight =
        Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const sectionHeight = rect.height;

      let progress = visibleHeight / sectionHeight;
      progress = Math.max(0, Math.min(1, progress * 1.5));

      setFullScreenProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
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
          // @ts-ignore
          document.webkitFullscreenElement !== null ||
          // @ts-ignore
          document.mozFullScreenElement !== null ||
          // @ts-ignore
          document.msFullscreenElement !== null,
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
        handleFullScreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange,
      );
    };
  }, []);

  const closeWindow = () => {
    setTimeLeft(0);
    setIsBreakComplete(true);
  };

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

  const resetTimer = () => {
    setTimeLeft(20);
    setProgressPercentage(0);
    setIsBreakComplete(false);
  };

  const containerStyle = {
    transform: `scale(${1 + fullScreenProgress * 0.03})`,
    transition: "transform 0.3s ease-out",
  };

  return (
    <section
      ref={sectionRef}
      className="w-full max-w-6xl mx-auto py-8 px-3 sm:px-4 md:py-16 flex justify-center items-center relative z-10"
    >
      <div className="w-full relative">
        {/*
          Responsive aspect ratios:
          - Mobile portrait: 9/14 (tall, phone-like)
          - Small tablet / landscape mobile: 3/4
          - Tablet landscape: 4/3
          - Desktop: 16/9
        */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[9/14] sm:aspect-[3/4] md:aspect-[4/3] lg:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-background"
          style={isFullScreen ? undefined : containerStyle}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <GradientBackground
              position="top"
              fromColor="#FF4C55"
              toColor="#9089fc"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full w-full p-4 sm:p-6 md:p-8 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
              {isBreakComplete ? (
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading text-center px-2 animate-in fade-in zoom-in duration-500">
                  Congrats, You took the break!
                </div>
              ) : (
                <>
                  {/* Timer circle — scales per breakpoint */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 mb-4 sm:mb-5 md:mb-6 shrink-0">
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 110 110"
                    >
                      <circle
                        className="text-gray-300/20 dark:text-gray-600/30"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="50"
                        cx="55"
                        cy="55"
                      />
                      <circle
                        className="text-primary transition-all duration-1000 ease-linear"
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
                      <span className="text-4xl sm:text-5xl md:text-[70px] lg:text-[90px] font-semibold tracking-tighter leading-none">
                        {timeLeft}
                      </span>
                    </div>
                  </div>

                  {/* Reminder text */}
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-heading text-center mb-4 sm:mb-5 md:mb-6 px-2 sm:px-4 leading-snug max-w-xl lg:max-w-2xl">
                    {reminderText}
                  </div>

                  {/* Time info — stacks vertically on mobile */}
                  <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-4 mb-5 sm:mb-6 md:mb-8 space-y-1.5 sm:space-y-0 text-xs sm:text-sm md:text-base">
                    <CurrentTime />
                    <div className="hidden sm:block w-px h-5 bg-foreground/20 rounded-full" />
                    <ScreenOnTime timeCount={timeCount} />
                  </div>

                  {/* Skip button */}
                  <Button
                    onClick={closeWindow}
                    variant="outline"
                    className="opacity-90 backdrop-blur-2xl rounded-full shadow-xl transition-colors border-white/20 hover:bg-white/10 dark:hover:bg-white/20 px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-5"
                  >
                    <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm md:text-base">
                      Skip this time
                    </span>
                  </Button>
                </>
              )}

              {/* Control buttons — smaller on mobile, bottom-right */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 flex space-x-2 md:space-x-3">
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-lg border-white/20 hover:bg-white/10 backdrop-blur-md h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  title="Reset timer"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </Button>
                <Button
                  onClick={toggleFullScreen}
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-lg border-white/20 hover:bg-white/10 backdrop-blur-md h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  title={
                    isFullScreen ? "Exit full screen" : "Enter full screen"
                  }
                >
                  <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden rotate-180 pointer-events-none">
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
    <div className="font-medium text-muted-foreground whitespace-nowrap">
      Current Time: <span className="text-foreground">{time}</span>
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
    <div className="font-medium text-muted-foreground whitespace-nowrap">
      Screen on Time:{" "}
      <span className="text-foreground">{formatTime(timeCount)}</span>
    </div>
  );
}
