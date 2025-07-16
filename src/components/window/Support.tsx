import cat_gif_paw from "../../assets/cute_cat_paw.gif";
import logo from "../../assets/newIcon.png";
import { Button } from "../ui/button";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const handleClose = async () => {
  const window = await getCurrentWebviewWindow();
  window.close();
};

const Support = () => {
  return (
    <div className="animate-in slide-in-from-top  relative w-[600px] h-[300px] bg-black rounded-3xl border-4 border-white flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="flex items-center justify-center gap-1">
        <img src={logo} className="h-4 w-4" alt="Blink Eye Logo" />
        <span className="text-white font-heading">Blink Eye</span>
      </div>
      {/* Cat GIF */}
      <img
        src={cat_gif_paw}
        alt="Cute cat waving"
        width="300px"
        className="absolute top-8 right-8 translate-x-1/4 -translate-y-1/4" // Position and slightly offset to match the image
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-4">
        <h1 className="text-white text-3xl font-heading leading-tight opacity-90">
          {/* Using font-sans as a placeholder for Urbanist. In a real project, you'd import Urbanist. */}
          Get A License Please
          <br />
          to Support the Developer
        </h1>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-white text-sm font-heading opacity-80">
            Starts
          </span>
          <span className="text-[#00E676] text-5xl font-heading">$9.99</span>
        </div>
        <Button className="bg-[#00E676] hover:bg-[#00C853] text-black font-heading py-3 px-8 rounded-xl text-lg shadow-lg transition-colors duration-200">
          <a href="https://blinkeye.app/en/pricing" target="_blank">
            Support the Developer
          </a>
        </Button>
        <p
          className="text-red-500 text-sm font-medium cursor-pointer hover:underline"
          onClick={handleClose}
        >
          No, Thanks. Remind me tomorrow!
        </p>
      </div>
    </div>
  );
};
export default Support;
