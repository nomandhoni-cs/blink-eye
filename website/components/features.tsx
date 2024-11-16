export function FeatureGridItem(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
      <div className="flex h-[180px] flex-col rounded-md p-6 gap-4">
        {props.icon}
        <div className="space-y-2">
          <h3 className="font-bold">{props.title}</h3>
          <p className="text-sm text-muted-foreground">{props.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FeatureGrid(props: {
  title: string;
  subtitle: string;
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}) {
  return (
    <section
      id="features"
      className="container space-y-6 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center space-y-4 text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          {props.title}
        </h2>
        <p className="max-w-[85%] text-gray-700 dark:text-gray-200  sm:text-lg">
          {props.subtitle}
        </p>
      </div>

      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
        {props.items.map((item, index) => (
          <FeatureGridItem key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
