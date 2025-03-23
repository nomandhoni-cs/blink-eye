"use client";

import { useEffect, useState } from "react";
import {
  Timer,
  Shield,
  Zap,
  Clock,
  Star,
  ArrowRight,
  Check,
  Gift,
} from "lucide-react";
// import Image from "next/image";

const PROMO_END_DATE_KEY = "promoEndDate";
const PROMO_CODE = "EXCLUSIVE10";
const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function OfferModal() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVisible, setIsVisible] = useState(true);
  const [promoActive, setPromoActive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let storedEndDate = localStorage.getItem(PROMO_END_DATE_KEY);

    if (!storedEndDate) {
      const endDate = new Date(Date.now() + TWO_DAYS_IN_MS).getTime();
      localStorage.setItem(PROMO_END_DATE_KEY, endDate.toString());
      storedEndDate = endDate.toString();
    }

    const calculateTimeLeft = () => {
      const difference = parseInt(storedEndDate!) - Date.now();

      if (difference > 0) {
        setPromoActive(true);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setPromoActive(false);
        localStorage.removeItem(PROMO_END_DATE_KEY);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PROMO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!promoActive || !isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="relative max-w-sm sm:max-w-md md:max-w-lg w-full">
        {/* Decorative elements */}
        <div className="absolute -top-6 -left-6 bg-[#fe4c55] w-12 h-12 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute -bottom-8 -right-8 bg-[#fe4c55] w-16 h-16 rounded-full opacity-30 blur-xl"></div>

        <div className="bg-gradient-to-br from-[#fe4c55] via-[#ff7b82] to-[#fe4c55] rounded-lg sm:rounded-xl shadow-2xl overflow-hidden border border-white/10">
          {/* Animated zigzag pattern at the top */}
          <div className="h-2 w-full bg-white/10 overflow-hidden">
            <div
              className="w-full h-full bg-white/20"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)",
                backgroundSize: "8px 8px",
                animation: "moveZigZag 20s linear infinite",
              }}
            ></div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1.5 hover:bg-white/20"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center justify-center text-white space-y-4 sm:space-y-5">
              <div className="flex flex-col items-center justify-center">
                {/* Top section with timer icon and flash sale heading side by side */}
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="animate-pulse bg-[#fe4c55] p-1.5 rounded-full ring-4 ring-white/10">
                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
                    Flash Sale!
                  </h2>
                </div>

                {/* Middle section with image and trusted text side by side */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src="https://p2myfh92qq.ufs.sh/f/93hqarYp4cDdjZZQwahyxJHVZk154Yhc37X0ag2LBmlSIEqj"
                      alt="Users of Blink Eye"
                      // width={140}
                      // height={50}
                      className="h-16 w-auto"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 fill-yellow-300 text-yellow-300"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-heading sm:text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    Trusted by 5,000+ Professionals
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center text-center">
                <div className="relative inline-flex items-center space-x-2">
                  <div className="absolute -top-1 -right-1 bg-yellow-300 text-black text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg">
                    Hot 10%
                  </div>
                  <span className="text-lg sm:text-xl md:text-2xl font-heading whitespace-nowrap">
                    Save 10% on
                  </span>
                  <span className="bg-yellow-300 text-[#fe4c55] font-heading py-1.5 px-4 rounded-full text-lg sm:text-xl md:text-2xl shadow-lg whitespace-nowrap">
                    LIFETIME ACCESS PACKAGE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-white/10 p-3 sm:p-4 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-white" />
                    <h4 className="text-xs sm:text-sm font-heading">
                      Lifetime Protection
                    </h4>
                  </div>
                  <p className="text-xs opacity-90">
                    One payment, lifetime updates and support
                  </p>
                </div>
                <div className="bg-white/10 p-3 sm:p-4 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-white" />
                    <h4 className="text-xs sm:text-sm font-heading">
                      Exclusive Features
                    </h4>
                  </div>
                  <p className="text-xs opacity-90">
                    Premium features & priority access
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="bg-white/5 border border-white/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-[#fe4c55]" />
                      Flash Sale Ends In:
                    </span>
                    <div className="flex items-center text-[#fe4c55] bg-white rounded-full px-2 py-0.5 shadow-sm">
                      <span className="text-xs font-bold animate-pulse">
                        Limited Time
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 text-center">
                    <div className="flex-1 bg-white/10 px-1 py-2 rounded-md border border-white/10 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                      <div className="relative text-lg sm:text-xl font-bold">
                        {timeLeft.days}
                      </div>
                      <div className="relative text-xs uppercase tracking-wider text-white/80">
                        Days
                      </div>
                    </div>
                    <div className="flex-1 bg-white/10 px-1 py-2 rounded-md border border-white/10 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                      <div className="relative text-lg sm:text-xl font-bold">
                        {timeLeft.hours}
                      </div>
                      <div className="relative text-xs uppercase tracking-wider text-white/80">
                        Hrs
                      </div>
                    </div>
                    <div className="flex-1 bg-white/10 px-1 py-2 rounded-md border border-white/10 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                      <div className="relative text-lg sm:text-xl font-bold">
                        {timeLeft.minutes}
                      </div>
                      <div className="relative text-xs uppercase tracking-wider text-white/80">
                        Min
                      </div>
                    </div>
                    <div className="flex-1 bg-white/10 px-1 py-2 rounded-md border border-white/10 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                      <div className="relative text-lg sm:text-xl font-bold">
                        {timeLeft.seconds}
                      </div>
                      <div className="relative text-xs uppercase tracking-wider text-white/80">
                        Sec
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span className="text-sm sm:text-base">Use code:</span>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center space-x-1 font-mono bg-white/10 px-3 py-1.5 rounded-md border border-white/20 transition-all hover:bg-white/20 group relative"
                    >
                      <span className="font-bold text-white">{PROMO_CODE}</span>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white/70 group-hover:text-white transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {copied ? "Copied!" : "Click to copy"}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsVisible(false)}
                    className="w-full bg-white text-[#fe4c55] font-heading text-sm sm:text-base py-3 sm:py-4 px-4 rounded-lg hover:bg-white/90 transition-all flex items-center justify-center space-x-2 group mt-2 shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full animate-shimmer"></div>
                    <Gift className="w-5 h-5" />
                    <span>Claim Your Lifetime Access Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/20 py-2 text-center text-white text-xs">
            <p>Limited time offer with the Limited seats. Claim ASAP!</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes moveZigZag {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 100% 0;
          }
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
