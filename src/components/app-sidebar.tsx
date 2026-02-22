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
  IoList,
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

// ── 1. Grouped Navigation Data ──

const mainNav = [{ title: "Dashboard", url: "/", icon: IoGrid }];

const proNav = [
  { title: "Todo List", url: "/todoList", icon: IoList },
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
          className="text-sm drop-shadow-sm"
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
      <Sidebar
        variant="floating"
        collapsible="icon"
        // ── THE CENTERING FIX ──
        // 1. !bottom-auto !h-fit: Stops shadcn from stretching it to 100vh (which caused the footer clip)
        // 2. !top-[calc(50vh+16px)]: 16px is exactly half of your 38px titlebar. This pushes the mathematical center perfectly.
        // 3. -translate-y-1/2: Pulls the sidebar up by half its own height, perfectly centering it.
        className="!top-[calc(50vh+16px)] !bottom-auto -translate-y-1/2 !h-fit max-h-[calc(100vh-38px-24px)] transition-all duration-300 z-40"
      >
        <SidebarContent className="gap-4 px-2 pt-4 pb-2 custom-scrollbar">
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

          {/* ── Productivity Section ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-1 flex items-center gap-1.5">
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
            <SidebarGroupLabel className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-1 flex items-center gap-1.5">
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

        {/* ── Footer: Minimal & Distinguishable ── */}
        <SidebarFooter className="p-2 pb-3">
          <SidebarMenu>
            {isPaidUser ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Pro Active"
                  className="cursor-default opacity-100 hover:bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    {/* The beautiful gradient emerald icon */}
                    <IoCheckmarkCircle
                      className="text-[1.1rem] drop-shadow-sm"
                      style={{ fill: "url(#emeraldGradient)" }}
                    />
                    <span className="font-heading text-[13px] font-semibold tracking-wide text-foreground">
                      Pro Active
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Unlock Premium"
                  className="hover:bg-amber-500/10 transition-colors"
                >
                  <Link
                    to="https://blinkeye.vercel.app/pricing"
                    target="_blank"
                  >
                    {/* The beautiful gradient amber icon */}
                    <IoSparkles
                      className="text-[1.1rem] drop-shadow-sm"
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
