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
      <SidebarTrigger className="p-4" />
      <main className="px-5 py-6 w-full">
        <AnnouncementBar />
        <UpdateDialog />
        <Outlet />
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
