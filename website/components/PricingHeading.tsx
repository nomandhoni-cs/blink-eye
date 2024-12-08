import { useMessages } from "next-intl";

const PricingHeading = () => {
  const messages = useMessages();

  return (
    <>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl">
          {messages.PricingGrid.pricingTitle
            ? messages.PricingGrid.pricingTitle
            : "Pricing"}
        </h2>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 dark:text-gray-300 sm:text-xl/8">
        {messages.PricingGrid.pricingDescription
          ? messages.PricingGrid.pricingDescription
          : "Choose an affordable plan that's packed with the best features forengaging your audience, creating customer loyalty, and driving sales."}
      </p>
    </>
  );
};
export default PricingHeading;
