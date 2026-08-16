// components/Command.tsx
"use client";

import React from "react";
import { CopyButton } from "./copy-button";
import { MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";
import { Terminal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";

interface CommandProps {
  children?: React.ReactNode;
  className?: string;
  tagName?: string;
  totalDownloads?: number;
}

export default function Command({
  children,
  className = "",
  tagName,
  totalDownloads,
}: CommandProps) {
  const macCommand =
    "brew install --cask nomandhoni-cs/blinkeye/blinkeye";
  const winCommand = "winget install NomanDhoni.BlinkEye";

  return (
    <div
      className={`w-full max-w-3xl mx-auto px-4 sm:px-0 font-sans ${className}`}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* CLI install line */}
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Install using{" "}
          <CommandPopover
            command={macCommand}
            label="Homebrew"
            icon={<MacIcon className="w-3.5 h-3.5 fill-current" />}
          />{" "}
          on macOS or{" "}
          <CommandPopover
            command={winCommand}
            label="winget"
            icon={<WindowsIcon className="w-3.5 h-3.5 fill-current" />}
          />{" "}
          on Windows
        </p>

        {/* Supported platforms */}
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          Supports macOS Intel/M Chip (ARM) | Windows 10, 11 (MSI, EXE) | Linux (Debian, AppImage, RPM, Tar.gz)
        </p>

        {/* Release info */}
        {(tagName || totalDownloads) && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 dark:text-zinc-500 pt-1">
            {tagName && (
              <Badge variant="outline">Latest: {tagName}</Badge>
            )}
            <span className="text-gray-300 dark:text-zinc-600">|</span>
            <Link
              href="/changelog"
              className="text-gray-500 dark:text-zinc-400 hover:text-[#FE4C55] dark:hover:text-[#FE4C55] font-medium transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-zinc-600 hover:decoration-[#FE4C55]"
            >
              Release Notes
            </Link>
            <span className="text-gray-300 dark:text-zinc-600">|</span>
            {totalDownloads != null && (
              <Badge variant="outline">Downloaded: {totalDownloads.toLocaleString()} times</Badge>
            )}
          </div>
        )}

        {/* Optional children slot */}
        {children && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function CommandPopover({
  command,
  label,
  icon,
}: {
  command: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-[#FE4C55] hover:text-[#ff6b73] underline underline-offset-4 decoration-[#FE4C55]/40 hover:decoration-[#FE4C55] transition-colors font-medium">
          {icon}
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-[440px] rounded-2xl border shadow-2xl p-5"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Terminal className="w-4 h-4 text-[#FE4C55]" />
            <span>Run this command</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-muted rounded-xl px-4 py-3">
            <code className="font-mono text-sm text-foreground overflow-x-auto whitespace-nowrap">
              {command}
            </code>
            <CopyButton
              value={command}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CommandBox({
  command,
  small = false,
}: {
  command: string;
  small?: boolean;
}) {
  return (
    <div className="group relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-0.5 bg-linear-to-r from-[#FE4C55]/20 to-[#FE4C55]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div
        className={`relative flex items-center justify-between bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl ${small ? "p-2" : "p-4 sm:p-5"
          } transition-colors group-hover:border-[#FE4C55]/30 shadow-sm`}
      >
        <code
          className={`font-mono text-gray-800 dark:text-zinc-300 ${small ? "text-xs" : "text-sm sm:text-base"
            } overflow-x-auto whitespace-nowrap mr-4 hide-scrollbar`}
        >
          {command}
        </code>
        <div className="shrink-0 pl-4 border-l border-gray-200 dark:border-white/10">
          <CopyButton
            value={command}
            className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
