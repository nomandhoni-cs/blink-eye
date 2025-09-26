import Image from "next/image";
import { CheckSquare } from "lucide-react";
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
  const t = useTranslations(); // Load translations
  const featuresDemo = t.raw("featuresDemo"); // Fetch the `featuresDemo` array
  const featuresHeader = useTranslations("featuresDemoHeader");

  return (
    <section className="w-full py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h2 className="mt-2 text-balance text-4xl font-heading tracking-wide sm:text-5xl md:text-6xl bg-gradient-to-r from-[#ff80b5] via-[#FE4C55] to-[#9089fc] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            {featuresHeader("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg text-zinc-400 sm:text-xl/8 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            {featuresHeader("description")}
          </p>
        </div>
        <div className="mt-16 space-y-24 lg:px-16">
          {featuresDemo.map((feature, index) => (
            <div
              key={index}
              className="relative group animate-in fade-in slide-in-from-bottom-10 duration-100 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glassmorphism glow effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:animate-pulse"></div>

              {/* Main glassmorphism card */}
              <Card className="relative overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 transition-all duration-100 hover:bg-white/20 dark:hover:bg-black/30 rounded-2xl hover:scale-[1.02] hover:shadow-3xl transform-gpu">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    {/* Full-width Image Content */}
                    <div className="w-full relative">
                      <div className="relative group/image">
                        {/* Enhanced glassmorphism container */}
                        <div className="relative bg-white/10 dark:bg-black/20 rounded-t-2xl overflow-hidden shadow-2xl backdrop-blur-xl border-b border-white/20 dark:border-white/10 hover:border-white/30 dark:hover:border-white/20 transition-all duration-100">
                          {/* Browser Mockup Header with glassmorphism */}
                          <div className="h-12 bg-white/20 dark:bg-black/30 backdrop-blur-sm flex items-center justify-between px-6 border-b border-white/20 dark:border-white/10">
                            {/* Traffic lights */}
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm hover:scale-110 transition-transform duration-100 hover:animate-pulse"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm hover:scale-110 transition-transform duration-100 hover:animate-pulse"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm hover:scale-110 transition-transform duration-100 hover:animate-pulse"></div>
                            </div>

                            {/* URL bar glassmorphism */}
                            <div className="flex-1 mx-6 px-4 py-1 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/20 dark:border-white/10 transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/30">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center">
                                Blink Eye -{" "}
                                <span className="text-xs font-normal opacity-75 animate-in fade-in duration-100 delay-100">
                                  {feature.moto}
                                </span>
                              </p>
                            </div>

                            {/* Menu dots */}
                            <div className="w-8 flex justify-center">
                              <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse"></div>
                            </div>
                          </div>

                          {/* Image with enhanced effects */}
                          <div className="relative overflow-hidden group/img">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500"></div>
                            <Image
                              src={featureImages[index] || featureImages[0]}
                              alt={feature.title}
                              width={1000}
                              height={650}
                              className="w-full h-auto object-contain transition-transform duration-700"
                              placeholder="blur"
                              blurDataURL={rgbDataURL(10, 10, 10)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text Content Below Image */}
                    <div className="w-full p-8 lg:p-12 space-y-6 relative">
                      {/* Content background glass effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/20 dark:from-white/5 dark:to-white/10 backdrop-blur-sm rounded-b-2xl"></div>

                      <div className="relative z-10">
                        <Badge
                          variant="secondary"
                          className="mb-4 text-sm font-medium bg-white/20 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-white/30 dark:border-white/20 backdrop-blur-sm animate-in slide-in-from-left duration-500"
                        >
                          Feature {index + 1}
                        </Badge>

                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading text-slate-800 dark:text-slate-100 mb-4 animate-in slide-in-from-left duration-500 delay-100">
                          {feature.title}
                        </h3>

                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6 max-w-4xl animate-in slide-in-from-left duration-500 delay-200">
                          {feature.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {feature.features.map((item, i) => (
                            <div
                              key={i}
                              className={`flex items-center space-x-3 text-slate-700 dark:text-slate-200 p-3 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105 hover:border-white/30 dark:hover:border-white/20 animate-in slide-in-from-bottom duration-500 fill-mode-both`}
                              style={{ animationDelay: `${(i + 3) * 100}ms` }}
                            >
                              <div className="p-1 mt-2 rounded-full fill-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex-shrink-0 animate-bounce">
                                <CheckSquare className="h-4 w-4 text-black dark:text-white" />
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
  );
}
