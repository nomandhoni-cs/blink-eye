import {
  Brush,
  Calendar,
  CheckCircle2,
  Clock,
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
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./ThemeToggle";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    isPremiumFeature: false,
  },
  {
    title: "Usage Time",
    url: "/usagetime",
    icon: Clock,
    isPremiumFeature: false,
  },
  {
    title: "Reminder Themes",
    url: "/reminderthemes",
    icon: Brush,
    isPremiumFeature: false,
  },
  {
    title: "Workday Setup",
    url: "#",
    icon: Calendar,
    isPremiumFeature: false,
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
  // const { canAccessPremiumFeatures, isTrialOn, isPaidUser } = usePremiumFeatures();
  const { isPaidUser } = usePremiumFeatures();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel>
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
              {items.map((item) => {
                return item.isPremiumFeature ? (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="cursor-not-allowed opacity-50 hover:opacity-80"
                      onClick={(e) => e.preventDefault()} // Prevent clicks
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        <span className="ml-auto">Soon!</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isPaidUser ? (
          <Button asChild className="bg-green-500 font-bold">
            <Link
              to="https://blinkeye.vercel.app/pricing"
              target="_blank"
              className="font-bold"
            >
              <CheckCircle2 className="h-6 w-6 font-bold" />
              <span>Pro Plan</span>
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="https://blinkeye.vercel.app/pricing" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              Get Premium
            </Link>
          </Button>
        )}
        <Button variant="secondary" asChild>
          <Link to="/about">
            <InfoIcon /> About Blink Eye
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
