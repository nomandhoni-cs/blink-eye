import Image from "next/image";
import { CheckSquare, Minus, X } from "lucide-react";
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
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

export default function FeatureShowcase() {
  const t = useTranslations(); // Load translations
  const featuresDemo = t.raw("featuresDemo"); // Fetch the `featuresDemo` array
  const featuresHeader = useTranslations("featuresDemoHeader");
  return (
    <section className="w-full py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="mt-2 text-balance text-4xl font-heading tracking-wide sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            {featuresHeader("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg text-zinc-400 sm:text-xl/8">
            {featuresHeader("description")}
          </p>
        </div>
        <div className="mt-16 space-y-24">
          {featuresDemo.map((feature, index) => (
            <div
              key={index}
              className="relative group perspective-1000"
              style={{
                transform: index % 2 === 0 ? "rotate(-2deg)" : "rotate(2deg)",
              }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative bg-slate-50 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 overflow-hidden transition-colors duration-300">
                <CardContent className="p-0">
                  <div
                    className={`flex flex-col ${
                      index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    } items-center`}
                  >
                    {/* Text Content */}
                    <div className="w-full lg:w-3/5 p-8 lg:p-12 space-y-6">
                      <Badge
                        variant="secondary"
                        className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Feature {index + 1}
                      </Badge>
                      <h3 className="text-2xl sm:text-3xl font-heading text-gray-800 dark:text-gray-100">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.features.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
                          >
                            <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Image Content */}
                    <div className="w-full lg:w-2/3 p-4 lg:p-8">
                      <div className="relative">
                        {/* Gradient Outline */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-70 transition-opacity duration-300 hover:opacity-90"></div>
                        <div className="relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-md">
                          {/* Browser Mockup Header */}
                          <div className="h-8 bg-gray-100 dark:bg-zinc-700 flex items-center justify-between px-4">
                            {/* Circles */}
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>

                            {/* Centered Text */}
                            <p className="text-[0.6rem] sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                              Blink Eye -{" "}
                              <span className="text-[0.6rem] sm:text-xs font-normal">
                                {feature.moto}
                              </span>
                            </p>

                            {/* Placeholder for Right Alignment */}
                            <div className="w-8"></div>
                          </div>

                          {/* Image */}
                          <Image
                            src={feature.imageSrc}
                            alt={feature.title}
                            width={1000}
                            height={650}
                            className="w-full h-auto object-cover"
                            placeholder="blur"
                            blurDataURL={rgbDataURL(10, 10, 10)}
                          />
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
