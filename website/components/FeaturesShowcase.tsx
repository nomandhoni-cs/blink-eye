import Image from "next/image";

interface Feature {
  title: string;
  description: string;
  imageSrc: string;
}

const features: Feature[] = [
  {
    title: "Customizable Reminders",
    description:
      "Set personalized reminders to take breaks and reduce eye strain.",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdliC0cvTporY6G7BSfdzITLcbnsF9hxDktAMi",
  },
  {
    title: "Multiple Themes",
    description: "Choose from a variety of themes to suit your preferences.",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDd31SVWUtCChVkLWdYfS9br7PBtcwnQxZpDAj8",
  },
  {
    title: "Usage Statistics",
    description: "Track your device usage and eye care habits over time.",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDde1yHOeAGUrMQKVoXBI75tih4E9gWPzmLdf16",
  },
  {
    title: "Workday Setup",
    description:
      "Setup your workday, worktime for individual days of the week.",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdLv6sw2RNqGpChfTslFLyAoEai9twkUOcB1W6",
  },
  {
    title: "Settings - Customize Everything",
    description: "Boost productivity with built-in Pomodoro technique support.",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDd5kcFr5neNhUXFVz5orgOZBLkIMm4aAl6c39R",
  },
  {
    title: "Activate License Key",
    description:
      "Choose your preferred notification sounds for a personalized experience.",
    imageSrc:
      "https://utfs.io/f/93hqarYp4cDdcn73xDMkT6pOqw0Iv1bCoQNrsReJ4itUMan3",
  },
];

const FeatureShowcase = () => {
  return (
    <section className="w-full py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Discover the Features that Make Us Stand Out
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
          Explore the features that make our app stand out. From customizable
          reminders to multiple themes, we've got you covered.
        </p>
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-8 md:gap-12`}
            >
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-2xl text-balance font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="aspect-video relative transition-all duration-300 hover:scale-120">
                  <Image
                    src={feature.imageSrc}
                    alt={feature.title}
                    width={1920}
                    height={1440}
                    className="transition-all duration-300 hover:scale-110"
                    quality={75}
                    sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
