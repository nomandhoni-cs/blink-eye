"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BadgeCheck, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

// Define image URLs directly in the component
const featureImages = [
  "https://utfs.io/f/93hqarYp4cDdyVm81X5aQNJFd2oOXG7Z936vVnlpPrH1xLjS",
  "https://utfs.io/f/93hqarYp4cDdATITuEkNsu2tghpYOvrPweEdIUQCoaGHlzZV",
  "https://utfs.io/f/93hqarYp4cDdrafHHy3NhGxbtIBmQTc63ULP0eSHODzof5Cy",
  "https://utfs.io/f/93hqarYp4cDdeyfjt8AGUrMQKVoXBI75tih4E9gWPzmLdf16",
  "https://utfs.io/f/93hqarYp4cDdpYNC7dOqB6uW7Y90kCtFoSKO1h82rMaQPLUI",
  "https://utfs.io/f/93hqarYp4cDdWlTbTT2ZbSGxFhzOli7j10ntQHMWJ539Pod2",
  "https://utfs.io/f/93hqarYp4cDdWJmmWS2ZbSGxFhzOli7j10ntQHMWJ539Pod2",
];

export default function FeatureShowcase() {
  const t = useTranslations();
  const featuresDemo = t.raw("featuresDemo");
  const featuresHeader = useTranslations("featuresDemoHeader");
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple fade-in on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px'
      }
    );

    const elements = containerRef.current?.querySelectorAll('.fade-in-scroll');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [featuresDemo]);

  return (
    <>
      <style jsx global>{`
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Simple fade in animation */
        .fade-in-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Optimize scrolling performance */
        * {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* GPU acceleration for smooth scrolling */
        .gpu-accelerate {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      <section className="w-full py-12" ref={containerRef}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mx-auto max-w-4xl text-center mb-12 fade-in-scroll">
            <h2 className="mt-2 text-5xl font-heading font-bold tracking-tight sm:text-6xl md:text-6xl bg-gradient-to-r from-[#ff80b5] via-[#FE4C55] to-[#9089fc] bg-clip-text text-transparent">
              {featuresHeader("title")}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-zinc-400 sm:text-xl/8">
              {featuresHeader("description")}
            </p>
          </div>

          {/* Features */}
          <div className="mt-16 space-y-24 lg:px-16">
            {featuresDemo.map((feature, index) => (
              <div
                key={index}
                className="fade-in-scroll gpu-accelerate"
              >
                <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {/* Image Section */}
                      <div className="w-full">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-t-2xl overflow-hidden">
                          {/* Browser Mockup Header */}
                          <div className="h-12 bg-gray-100 dark:bg-[#18181a] flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                            {/* Traffic lights */}
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>

                            {/* URL bar */}
                            <div className="flex-1 mx-6 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">
                                Blink Eye - <span className="text-xs font-normal opacity-75">{feature.moto}</span>
                              </p>
                            </div>

                            {/* Menu dots */}
                            <div className="w-8 flex justify-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            </div>
                          </div>

                          {/* Image */}
                          <div className="relative">
                            <Image
                              src={featureImages[index] || featureImages[0]}
                              alt={feature.title}
                              width={1000}
                              height={650}
                              className="w-full h-auto object-contain"
                              placeholder="blur"
                              blurDataURL={rgbDataURL(10, 10, 10)}
                              loading={index === 0 ? "eager" : "lazy"}
                              priority={index === 0}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="w-full p-8 lg:p-12 space-y-6">
                        <div>
                          <Badge
                            variant="secondary"
                            className="mb-4 text-sm font-medium"
                          >
                            Feature {index + 1}
                          </Badge>

                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-gray-900 dark:text-gray-100 mb-4">
                            {feature.title}
                          </h3>

                          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 max-w-4xl">
                            {feature.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {feature.features.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                              >
                                <div className="p-1 rounded-full bg-gradient-to-r from-red-500 to-red-500 flex-shrink-0">
                                  <BadgeCheck className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}