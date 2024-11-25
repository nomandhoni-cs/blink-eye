import { Button } from "./ui/button";


const DownloadButton = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <Button
      asChild
      className="bg-[#FE4C55] hover:bg-[#FE4C55] h-16 py-4 px-6 rounded-full flex items-center space-x-1 w-full"
    >
      <a href={href} className="flex items-center space-x-2 w-full">
        {icon}
        <span className="text-lg text-black">{label}</span>
      </a>
    </Button>
  );
};

export default DownloadButton;
