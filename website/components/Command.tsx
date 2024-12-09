"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CopyButton } from "./copy-button";
import { MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";

export function Command() {
  const [isMac, setIsMac] = useState(true);
  const macCommand =
    "brew tap nomandhoni-cs/blinkeye && brew install --cask blinkeye";
  const winCommand = "winget install NomanDhoni.BlinkEye";
  const xattrCommand = "xattr -d com.apple.quarantine /path/to/Blink\\ Eye.app";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2 px-4 sm:px-0">
      <div className="flex justify-center items-center">
        <div className="inline-flex items-center bg-secondary rounded-full p-1">
          <ToggleButton
            icon={<MacIcon />}
            label="macOS"
            isActive={isMac}
            onClick={() => setIsMac(true)}
          />
          <ToggleButton
            icon={<WindowsIcon />}
            label="Windows"
            isActive={!isMac}
            onClick={() => setIsMac(false)}
          />
        </div>
      </div>

      <div className="text-center space-y-2 sm:space-y-2">
        <h2 className="text-2xl sm:text-3xl font-heading">
          Kindly install with{" "}
          {isMac ? "Homebrew on macOS" : "winget on Windows"}
        </h2>
        {isMac && <MacOSWarning xattrCommand={xattrCommand} />}
      </div>

      <div className="flex justify-center">
        <CommandBox command={isMac ? macCommand : winCommand} />
      </div>
    </div>
  );
}

function ToggleButton({ icon, label, isActive, onClick }) {
  return (
    <button
      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors ${
        isActive
          ? "bg-[#FE4C55] text-black"
          : "text-foreground/80 hover:text-foreground"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </button>
  );
}

function MacOSWarning({ xattrCommand }) {
  return (
    <div className="text-xs sm:text-sm text-muted-foreground text-center">
      <p className="mb-2">
        Blink Eye is not notarized yet, so you might encounter an error due to
        MacOS Gatekeeper. If you face this issue, follow the
      </p>
      <Popover>
        <PopoverTrigger>
          <span className="cursor-pointer hover:underline text-[#FE4C55]">
            Installation guide
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] sm:w-80">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">
            Bypass Gatekeeper - Installation Instructions:
          </h3>
          <div className="text-xs sm:text-sm space-y-2">
            <p>
              <strong className="text-primary">Important Notice</strong>: Apple
              requires developers to pay $100/year for app notarization. As a
              small developer, this cost is significant, so this app has not
              been notarized.
            </p>
            <p>
              As a result, macOS Gatekeeper might block the app. You can bypass
              this restriction using one of the following methods:
            </p>
            <ol className="list-decimal pl-4 sm:pl-5 space-y-2">
              <li>
                <strong>Via Finder:</strong>
                <ul className="list-disc pl-4 sm:pl-5">
                  <li>Right-click the app in Finder.</li>
                  <li>Select "Open" to allow it to run.</li>
                </ul>
              </li>
              <li>
                <strong>Via Terminal:</strong>
                <ul className="list-disc pl-4 sm:pl-5">
                  <li>
                    Run the following command to remove the Gatekeeper
                    quarantine attribute:
                    <CommandBox command={xattrCommand} />
                  </li>
                </ul>
              </li>
            </ol>
            <p className="font-bold mt-4">
              Your understanding and support for independent developers like me
              are greatly appreciated! 💡
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function CommandBox({ command }) {
  return (
    <div className="relative inline-block group max-w-full">
      <div className="absolute -inset-1 bg-[#FE4C55] rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative px-3 sm:px-4 py-2 sm:py-3 bg-background ring-1 ring-primary rounded-lg leading-none flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
        <code className="text-foreground font-mono text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap">
          {command}
        </code>
        <CopyButton value={command} />
      </div>
    </div>
  );
}

export default Command;
