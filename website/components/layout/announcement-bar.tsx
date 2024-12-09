import { Megaphone } from "lucide-react";

const AnnouncementBar = () => {
  return (
    <div className="bg-[#FE4C55] text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <Megaphone className="h-5 w-5" />
          <span className="text-sm sm:text-base font-medium">
            Blink Eye is Now Available for MacOS, Windows, Linux
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
