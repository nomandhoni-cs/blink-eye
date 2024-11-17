import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Brush,
  Calendar,
  CheckCircle2,
  Clock,
  FlameIcon,
  Home,
  InfoIcon,
  ScrollTextIcon,
  Settings,
} from "lucide-react";
import logo from "../assets/icon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { ModeToggle } from "./ThemeToggle";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { Separator } from "./ui/separator";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    isPremiumFeature: false,
  },
  {
    title: "Reminder Themes",
    url: "/reminderthemes",
    icon: Brush,
    isPremiumFeature: true,
  },
  {
    title: "Usage Time",
    url: "/usageTime",
    icon: Clock,
    isPremiumFeature: true,
  },
  {
    title: "Workday Setup",
    url: "/workday",
    icon: Calendar,
    isPremiumFeature: true,
  },
  {
    title: "Settings",
    url: "/allSettings",
    icon: Settings,
    isPremiumFeature: false,
  },
  {
    title: "Activate License",
    url: "/activatelicense",
    icon: ScrollTextIcon,
    isPremiumFeature: false,
  },
];

export function AppSidebar() {
  const { isPaidUser } = usePremiumFeatures();
  const location = useLocation();

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-0 py-2">
            <SidebarGroupLabel className="flex items-center">
              <img
                src={logo}
                className="w-[1.2rem] h-[1.2rem] mr-2"
                alt="Blink Eye"
              />
              Blink Eye
            </SidebarGroupLabel>
            <ModeToggle />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <React.Fragment key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      className="w-full transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <Link to={item.url}>
                        <div className="flex items-center justify-between w-full py-2">
                          <span className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.title}</span>
                          </span>
                          {item.isPremiumFeature && (
                            <span className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400">
                              <FlameIcon className="h-4 w-4" />
                              <span className="text-xs font-medium">Pro</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {index < items.length - 1 && (
                    <Separator className="my-1 opacity-50" />
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        {isPaidUser ? (
          <Button
            asChild
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
          >
            <Link
              to="https://blinkeye.vercel.app/pricing"
              target="_blank"
              className="flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Premium Plan</span>
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full">
            <Link
              to="https://blinkeye.vercel.app/pricing"
              target="_blank"
              className="flex items-center justify-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.49 4.49 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Get Premium</span>
            </Link>
          </Button>
        )}
        <Button variant="secondary" asChild className="w-full">
          <Link
            to="/about"
            className="flex items-center justify-center space-x-2"
          >
            <InfoIcon className="h-5 w-5" />
            <span>About Blink Eye</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
