import { Megaphone } from "lucide-react";

const AnnouncementBar = () => {
  return (
    <div className="bg-[#FE4C55] relative flex items-center justify-center">
      <span className="text-center py-2 flex">
        <Megaphone />
        <span>Blink Eye is Now Available for MacOS, Windows, Linux</span>
      </span>
      {/* <Link
        href="https://www.producthunt.com/posts/blink-eye?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-blink&#0045;eye"
        target="_blank"
      >
        <span className="text-center p-4 flex">
          <Megaphone />
          <span>Blink Eye is now on Product Hunt</span>
        </span>
      </Link> */}
    </div>
  );
};

export default AnnouncementBar;
