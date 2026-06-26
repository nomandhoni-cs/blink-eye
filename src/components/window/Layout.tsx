import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { Toaster } from "react-hot-toast";
import { UpdateDialog } from "../BlinkEyeUpdater";
import AnnouncementBar from "../AnnouncementBar";
import { usePremiumFeatures } from "../../contexts/PremiumFeaturesContext";
import { ScrollArea } from "../ui/scroll-area";
import SupportDeveloperHandler from "../SupportDeveloperHandler";
import { TITLEBAR_OVERLAY_H } from "../TitleBarOverlay";

export default function Layout() {
  const { isPaidUser } = usePremiumFeatures();
  return (
    <SidebarProvider>
      <AppSidebar />
      {/*
        Content area sits to the right of the sidebar and below the
        native window titlebar + TitleBarOverlay. SidebarInset handles
        the horizontal offset automatically based on sidebar state.
        decorations: true in tauri.conf.json preserves all native OS
        features (Mission Control, Snap Assist, fullscreen transitions).
      */}
      <SidebarInset className="h-svh">
        <div
          className="h-full w-full"
          style={{ paddingTop: `${TITLEBAR_OVERLAY_H}px` }}
        >
          <ScrollArea className="h-full w-full px-4 py-2">
            {!isPaidUser && <AnnouncementBar />}
            <UpdateDialog />
            <Outlet />
          </ScrollArea>
        </div>
      </SidebarInset>
      <SupportDeveloperHandler />
      <Toaster />
    </SidebarProvider>
  );
}