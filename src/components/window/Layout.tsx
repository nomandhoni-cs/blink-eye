import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <main className="px-5 py-6 w-full">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
