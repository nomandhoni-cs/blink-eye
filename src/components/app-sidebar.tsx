import { Link, useLocation } from "react-router-dom";
// Perfectly filled, rounded, modern icons
import {
  IoGrid,
  IoBarChart,
  IoColorPalette,
  IoCalendar,
  IoDesktop,
  IoSettings,
  IoChatbubble,
  IoInformationCircle,
  IoFlame,
  IoCheckmarkCircle,
  IoSparkles,
  IoKey,
  IoColorWand,
  IoTimer,
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
import { useAccentColor } from "../contexts/AccentColorContext";
import { LucideListTodo } from "lucide-react";
import { PiMonitorFill } from "react-icons/pi";
import { UpdateChecker } from "./UpdateChecker";
import { TitleBarOverlay, TITLEBAR_OVERLAY_H } from "./TitleBarOverlay";
import { SidebarNotch } from "./SidebarNotch";
import { platform } from "@tauri-apps/plugin-os";
import { generateBrandShades } from "../lib/color-utils";

const isMac = platform() === "macos";

// ── 1. Grouped Navigation Data ──

const mainNav = [{ title: "Dashboard", url: "/", icon: IoGrid }];

const proNav = [
  { title: "Reminder Settings", url: "/reminderSettings", icon: IoTimer },
  { title: "Usage Time", url: "/usageTime", icon: IoBarChart },
  { title: "Reminder Themes", url: "/reminderthemes", icon: IoColorPalette },
  { title: "Multi-Monitor", url: "/multimonitor", icon: PiMonitorFill },
  { title: "Todo List", url: "/todoList", icon: LucideListTodo },
  { title: "Workday Setup", url: "/workday", icon: IoCalendar },
  { title: "Screen Savers", url: "/screenSavers", icon: IoDesktop },
];

const systemNav = [
  { title: "Settings", url: "/allSettings", icon: IoSettings },
  { title: "Theme Picker", url: "/themePicker", icon: IoColorWand },
  { title: "Activate License", url: "/activatelicense", icon: IoKey },
  {
    title: "Submit Feedback",
    url: "https://tally.so/r/wo0ZrN",
    icon: IoChatbubble,
    external: true,
  },
  { title: "About", url: "/about", icon: IoInformationCircle },
];

// Dynamically collect all nav URLs for shade assignment
const allNavItems = [...mainNav, ...proNav, ...systemNav];
const allNavUrls = allNavItems.map((item) => item.url);

// Generate brand shades from base color (dynamic, based on nav count)
function getBrandShades(baseColor: string) {
  const shades = generateBrandShades(baseColor, allNavUrls.length);
  return allNavUrls.reduce((acc, route, index) => {
    acc[route] = {
      bg: shades[index],
      icon: "text-white",
      index,
    };
    return acc;
  }, {} as Record<string, { bg: string; icon: string; index: number }>);
}

// macOS-style Icon Badge Component with rounded corners
function IconBadge({
  url,
  brandColor,
  isActive,
  children,
}: {
  url: string;
  brandColor: string;
  isActive?: boolean;
  children: React.ReactNode;
}) {
  const iconColors = getBrandShades(brandColor);
  const colors = iconColors[url] || { bg: "#690000", icon: "text-white", index: 9 };
  return (
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-[6px] ${colors.icon} shadow-sm ${isActive ? "ring-2 ring-foreground/30 ring-offset-1 ring-offset-background" : ""}`}
      style={{ backgroundColor: colors.bg }}
    >
      {children}
    </div>
  );
}

const SIDEBAR_TOP_OFFSET = TITLEBAR_OVERLAY_H;

// ── 2. The Original Flame Pro Badge (Refined) ──

function ProBadge({ isPaidUser }: { isPaidUser: boolean }) {
  if (isPaidUser) return null;

  return (
    <SidebarMenuBadge className="pointer-events-none pr-1">
      <IoFlame
        className="text-[11px] drop-shadow-sm text-amber-500 dark:text-amber-400"
      />
    </SidebarMenuBadge>
  );
}

// ── 4. Main Component ───────────────────────────────────────────

export function AppSidebar() {
  const { isPaidUser } = usePremiumFeatures();
  const { accentHex } = useAccentColor();
  const { pathname } = useLocation();

  return (
    <>
      <TitleBarOverlay />

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
        className={"!top-0 !h-svh border-none z-40"}
      >
        <SidebarContent
          className={`gap-2 px-2 ${isMac ? "pt-8" : "pt-2"} pb-2 custom-scrollbar group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-2`}
          style={{ height: `calc(100svh - ${SIDEBAR_TOP_OFFSET}px)` }}
        >
          {/* ── General Section ── */}
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="transition-all duration-200 hover:bg-accent/80 data-active:bg-transparent data-active:text-foreground"
                    >
                      <Link to={item.url}>
                        <IconBadge url={item.url} brandColor={accentHex} isActive={pathname === item.url}>
                          <item.icon className="text-[0.75rem]" />
                        </IconBadge>
                        <span className="font-heading text-[12.5px] font-normal tracking-wide group-data-[active=true]/menu-button:font-semibold">
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
            <SidebarGroupLabel className="h-6 font-heading text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-0.5">
              Features
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {proNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="transition-all duration-200 hover:bg-accent/80 data-active:bg-transparent data-active:text-foreground"
                    >
                      <Link to={item.url}>
                        <IconBadge url={item.url} brandColor={accentHex} isActive={pathname === item.url}>
                          <item.icon className="text-[0.75rem]" />
                        </IconBadge>
                        <span className="font-heading text-[12.5px] font-normal tracking-wide group-data-[active=true]/menu-button:font-semibold">
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
            <SidebarGroupLabel className="h-6 font-heading text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase px-3 mb-0.5">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {systemNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="transition-all duration-200 hover:bg-accent/80 text-muted-foreground hover:text-foreground data-active:bg-transparent data-active:text-foreground"
                    >
                      <Link
                        to={item.url}
                        target={item.external ? "_blank" : "_self"}
                      >
                        <IconBadge url={item.url} brandColor={accentHex} isActive={pathname === item.url}>
                          <item.icon className="text-[0.75rem]" />
                        </IconBadge>
                        <span className="font-heading text-[12.5px] font-normal tracking-wide group-data-[active=true]/menu-button:font-semibold">
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

        <SidebarSeparator className="opacity-50"/>

        {/* ── Footer ── */}
        <SidebarFooter className="p-2 pb-3">
          <SidebarMenu>
            {isPaidUser ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  tooltip="Pro Active"
                  className="cursor-default border border-green-500/25 dark:border-green-400/20 bg-green-500/5 dark:bg-green-400/5 hover:bg-green-500/5 dark:hover:bg-green-400/5"
                >
                  <IoCheckmarkCircle className="text-[0.95rem] shrink-0 text-green-500 dark:text-green-400" />
                  <span className="font-heading text-[13px] font-semibold tracking-wide text-green-700 dark:text-green-400">
                    Activated
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  tooltip="Unlock Premium"
                  className="relative overflow-hidden border border-amber-500/25 dark:border-amber-400/20 bg-amber-500/5 dark:bg-amber-400/5 hover:border-amber-500/50 dark:hover:border-amber-400/35 shadow-sm transition-all group"
                >
                  <Link to="https://blinkeye.app/en/pricing" target="_blank">
                    {/* Shine sweep — plays once per hover, no idle animation */}
                    <div
                      className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:animate-shine"
                      style={{
                        background:
                          "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 55%, transparent 70%)",
                        backgroundSize: "200% 100%",
                      }}
                    />

                    <IoSparkles
                      className="relative z-10 text-[0.95rem] drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] shrink-0"
                      style={{ fill: "url(#amberGradient)" }}
                    />
                    <span className="relative z-10 font-heading text-[13px] font-bold tracking-wide text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                      Unlock Premium
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
          {/* ── Version & Update Check ── */}
          <UpdateChecker />
        </SidebarFooter>

        {/* ── Notch button on the right edge — toggles sidebar open/closed ── */}
        <SidebarNotch />
      </Sidebar>
    </>
  );
}
