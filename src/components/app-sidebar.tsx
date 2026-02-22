import React from "react";
import { Link, useLocation } from "react-router-dom";
// Perfectly filled, rounded, modern icons
import {
  IoGrid,
  IoBarChart,
  IoColorPalette,
  IoCalendar,
  IoDesktop,
  IoSettings,
  IoDocumentText,
  IoChatbubble,
  IoInformationCircle,
  IoFlame,
  IoCheckmarkCircle,
  IoSparkles,
} from "react-icons/io5";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import { LucideListTodo } from "lucide-react";

// ── 1. Grouped Navigation Data ──

const mainNav = [{ title: "Dashboard", url: "/", icon: IoGrid }];

const proNav = [
  { title: "Todo List", url: "/todoList", icon: LucideListTodo },
  { title: "Usage Time", url: "/usageTime", icon: IoBarChart },
  { title: "Reminder Themes", url: "/reminderthemes", icon: IoColorPalette },
  { title: "Workday Setup", url: "/workday", icon: IoCalendar },
  { title: "Screen Savers", url: "/screenSavers", icon: IoDesktop },
];

const systemNav = [
  { title: "Settings", url: "/allSettings", icon: IoSettings },
  { title: "Activate License", url: "/activatelicense", icon: IoDocumentText },
  {
    title: "Submit Feedback",
    url: "https://tally.so/r/wo0ZrN",
    icon: IoChatbubble,
    external: true,
  },
  { title: "About", url: "/about", icon: IoInformationCircle },
];

// ── 2. The Original Flame Pro Badge (Refined) ──

function ProBadge({ isPaidUser }: { isPaidUser: boolean }) {
  if (isPaidUser) return null; // Clean UI for paid users

  return (
    <SidebarMenuBadge className="pointer-events-none pr-1">
      <span className="flex items-center gap-1">
        <IoFlame
          className="text-[13px] drop-shadow-sm"
          style={{ fill: "url(#amberGradient)" }}
        />
        <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">
          Pro
        </span>
      </span>
    </SidebarMenuBadge>
  );
}

// ── 3. Main Component ──

export function AppSidebar() {
  const { isPaidUser } = usePremiumFeatures();
  const { pathname } = useLocation();

  return (
    <>
      {/* Invisible SVG for Icon Gradients */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <linearGradient
            id="emeraldGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop stopColor="#10B981" offset="0%" />
            <stop stopColor="#0EA5E9" offset="100%" />
          </linearGradient>
          <linearGradient
            id="amberGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop stopColor="#F59E0B" offset="0%" />
            <stop stopColor="#E11D48" offset="100%" />
          </linearGradient>
        </defs>
      </svg>

      <Sidebar
        variant="floating"
        collapsible="icon"
        // ── THE MATH FIX ──
        // !top-[38px] ensures it starts exactly under the custom titlebar.
        // !h-[calc(100svh-38px)] forces exact height, preventing the footer from clipping off-screen.
        className="!top-[38px] !h-[calc(100svh-38px)] border-none shadow-md z-40"
      >
        <SidebarContent className="gap-4 px-2 pt-3 pb-2 custom-scrollbar">
          {/* ── General Section ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-1">
              General
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="transition-all duration-200 hover:bg-accent/80"
                    >
                      <Link to={item.url}>
                        <item.icon className="text-[1.1rem] opacity-80" />
                        <span className="font-heading text-[13px] font-medium tracking-wide">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── Features Section ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-1">
              Features
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {proNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="transition-all duration-200 hover:bg-accent/80"
                    >
                      <Link to={item.url}>
                        <item.icon className="text-[1.1rem] opacity-80 text-primary/80" />
                        <span className="font-heading text-[13px] font-medium tracking-wide">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    <ProBadge isPaidUser={isPaidUser} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ── System Section ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-1">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {systemNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="transition-all duration-200 hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                    >
                      <Link
                        to={item.url}
                        target={item.external ? "_blank" : "_self"}
                      >
                        <item.icon className="text-[1.1rem] opacity-60" />
                        <span className="font-heading text-[13px] font-medium tracking-wide">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator className="mx-4 my-0 opacity-50" />

        {/* ── Footer ── */}
        <SidebarFooter className="p-2 pb-3">
          <SidebarMenu>
            {isPaidUser ? (
              <SidebarMenuItem>
                {/* FIX: Removed the wrapper div. Shadcn handles transition perfectly when Icon + Span are direct children */}
                <SidebarMenuButton
                  tooltip="Pro Active"
                  className="cursor-default opacity-100 hover:bg-transparent"
                >
                  <IoCheckmarkCircle
                    className="text-[1.1rem] drop-shadow-sm shrink-0"
                    style={{ fill: "url(#emeraldGradient)" }}
                  />
                  <span className="font-heading text-[13px] font-semibold tracking-wide text-foreground">
                    Pro Active
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                {/* FIX: Same here. Anchor tag contains Icon + Span as direct children. Smooth as butter. */}
                <SidebarMenuButton
                  asChild
                  tooltip="Unlock Premium"
                  className="hover:bg-amber-500/10 transition-colors"
                >
                  <Link to="https://blinkeye.app/en/pricing" target="_blank">
                    <IoSparkles
                      className="text-[1.1rem] drop-shadow-sm shrink-0"
                      style={{ fill: "url(#amberGradient)" }}
                    />
                    <span className="font-heading text-[13px] font-bold tracking-wide text-foreground">
                      Unlock Premium
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
