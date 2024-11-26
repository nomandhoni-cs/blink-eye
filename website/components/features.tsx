import { features } from "@/utils/features";
import React from "react";

export function FeatureGridItem(props: {
  icon: React.ElementType; // Expecting a component type
  title: string;
  description: string;
}) {
  const Icon = props.icon; // Use the passed component type as JSX
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
      <div className="flex h-[200px] flex-col rounded-md p-6 gap-4">
        <span className="h-20 w-20">
          <Icon className="h-12 w-12 text-primary" /> {/* Render the icon */}
        </span>
        <div className="space-y-2">
          <h3 className="text-pretty text-xl font-semibold">{props.title}</h3>
          <p className="text-sm text-muted-foreground">{props.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FeatureGrid(props: { title: string; subtitle: string }) {
  return (
    <section
      id="features"
      className="container space-y-6 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center space-y-4 text-center">
        <h2 className="mt-2 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          {props.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
          {props.subtitle}
        </p>
      </div>

      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
        {features.map((item, index) => (
          <FeatureGridItem
            key={index}
            icon={item.icon} // Pass the component type
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </section>
  );
}
