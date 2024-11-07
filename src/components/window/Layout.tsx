import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Toaster } from "react-hot-toast";
import { UpdateDialog } from "../BlinkEyeUpdater";
import AnnouncementBar from "../AnnouncementBar";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="px-4 py-2 w-full">
        <SidebarTrigger />
        <AnnouncementBar />
        <UpdateDialog />
        <Outlet />
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
