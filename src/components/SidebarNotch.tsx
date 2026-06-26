// src/components/SidebarNotch.tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon, SidebarRightIcon } from "@hugeicons/core-free-icons";
import { useSidebar } from "./ui/sidebar";
import { cn } from "../lib/utils";

/**
 * A notch button that sits exactly on the right edge of the sidebar,
 * vertically centered. Half of it merges into the sidebar surface,
 * the other half pokes out as a small tab.
 *
 * Visually:
 *   - Expanded: chevron points left (clicking will collapse)
 *   - Collapsed: chevron points right (clicking will expand)
 *
 * Because it lives inside the Sidebar's render tree, its position
 * animates with the sidebar's width transition — when the sidebar
 * collapses to icon mode, the notch slides left along with it.
 */
export function SidebarNotch() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      // `-right-2` puts the notch's left edge exactly at the
      // sidebar-inner's right edge (the container has p-2 = 8px outer
      // padding, so the visible inner box ends 8px in from the
      // container's right). The notch is 16px wide, so half of it
      // sits inside the visible sidebar (merged with the surface) and
      // half pokes out past the sidebar's right edge.
      //
      // Right side is rounded (matches the sidebar's outer curve in
      // spirit), left side is flat — so it reads as a tab emerging
      // FROM the sidebar edge, not a separate pill.
      className={cn(
        // Positioned flush against the sidebar's right edge — entirely
        // outside the content area, no overlap. `-ml-px` seals any
        // sub-pixel gap between the notch and the sidebar border.
        "absolute right-0 top-1/2 -translate-y-1/2 translate-x-full -ml-px z-30",
        "flex items-center justify-center h-8 w-5 pr-1",
        "rounded-r-full bg-sidebar",
        // Top + right + bottom border only — no left border so the
        // notch reads as an extension of the sidebar edge.
        "border border-l-0 border-sidebar-border",
        "shadow-[1px_0_2px_rgba(0,0,0,0.05)]",
        "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
        "transition-all duration-200 ease-out",
      )}
    >
      <HugeiconsIcon
        icon={isCollapsed ? SidebarRightIcon : SidebarLeftIcon}
        strokeWidth={2.25}
        className="size-4"
      />
    </button>
  );
}
