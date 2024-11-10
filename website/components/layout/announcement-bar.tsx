import { Megaphone } from "lucide-react";
import Link from "next/link";

const AnnouncementBar = () => {
  return (
    <div className="bg-[#FE4C55] h-8 flex justify-center items-center divide-x-2 divide-current">
      <span className="text-center p-4 flex space-x-2">
        <Megaphone />
        <span>Blink Eye is Now Available for MacOS, Windows, Linux</span>
      </span>
      <Link
        href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
        target="_blank"
        className="invisible sm:visible"
      >
        <span className="text-center p-4 flex space-x-2">
          <Megaphone />
          <span>Blink Eye is now on Product Hunt</span>
        </span>
      </Link>
    </div>
  );
};

export default AnnouncementBar;
