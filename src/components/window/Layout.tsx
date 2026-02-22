import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { Toaster } from "react-hot-toast";
import { UpdateDialog } from "../BlinkEyeUpdater";
import AnnouncementBar from "../AnnouncementBar";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { ScrollArea } from "../ui/scroll-area";
import SupportDeveloperHandler from "../SupportDeveloperHandler";
import { CustomTitlebar } from "../CustomTitlebar";

export default function Layout() {
  const { isPaidUser } = usePremiumFeatures();
  return (
    <SidebarProvider>
      <CustomTitlebar />
      <AppSidebar />
      {/*<GradientBackground
        position="top"
        rotate={30}
        fromColor="#ff80b5"
        toColor="#FE4C55"
      />*/}
      <ScrollArea className="h-[calc(100vh-38px)] px-4 py-2 w-full mt-[38px]">
        {!isPaidUser && <AnnouncementBar />}
        <UpdateDialog />
        <Outlet />
      </ScrollArea>
      <SupportDeveloperHandler />
      <Toaster />
    </SidebarProvider>
  );
}
