import { Command, Space } from "lucide-react";

const HowToCloseScreenSaver = () => {
  return (
    <h3 className="text-lg font-semibold text-center text-muted-foreground mt-4">
      Press (CTRL+ Space)
      <span className="inline-flex items-center px-2 py-1 mx-1 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm space-x-1">
        <Command className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span>+</span>
        <Space className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </span>
      to close the Screen Saver.
    </h3>
  );
};

export default HowToCloseScreenSaver;
