import { BugIcon, MonitorCog } from "lucide-react";

const Soon = () => {
  return (
    <div className="flex items-center justify-center mt-40">
      <div className="text-center">
        {/* Construction Icon */}
        <MonitorCog className="mx-auto h-40 w-40 mb-4" />

        {/* Text */}
        <h1 className="text-2xl font-semibold mb-2 flex items-center justify-center">
          Fixing some last moment bugs <BugIcon className="mx-2" /> and making
          improvements
        </h1>
        <p className="text-lg">This feature will be available soon.</p>
      </div>
    </div>
  );
};

export default Soon;
