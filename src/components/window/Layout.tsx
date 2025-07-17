import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Toaster } from "react-hot-toast";
import { UpdateDialog } from "../BlinkEyeUpdater";
import AnnouncementBar from "../AnnouncementBar";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { ScrollArea } from "../ui/scroll-area";
import GradientBackground from "../GradientBackground";
import SupportDeveloperHandler from "../SupportDeveloperHandler";

export default function Layout() {
  const { isPaidUser } = usePremiumFeatures();
  return (
    <SidebarProvider>
      <AppSidebar />
      <GradientBackground
        position="top"
        rotate={30}
        fromColor="#ff80b5"
        toColor="#FE4C55"
      />
      <ScrollArea className="h-[100vh] px-4 py-2 w-full">
        <SidebarTrigger />
        {!isPaidUser && <AnnouncementBar />}
        <UpdateDialog />
        <Outlet />
      </ScrollArea>
      <SupportDeveloperHandler />
      <Toaster />
    </SidebarProvider>
  );
}
