"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CopyButton } from "./copy-button";
import { MacIcon, WindowsIcon } from "@/utils/mac-win-linicon";

export function Command({ children }: { children?: React.ReactNode }) {
  const [isMac, setIsMac] = useState(true);
  const macCommand =
    "brew tap nomandhoni-cs/blinkeye && brew install --cask blinkeye";
  const winCommand = "winget install NomanDhoni.BlinkEye";
  const xattrCommand =
    "xattr -d com.apple.quarantine /path/to/Blink\\ Eye.app";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 px-4 sm:px-0 font-sans">
      <div className="flex justify-center items-center">
        <div className="inline-flex items-center bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-full p-1.5 backdrop-blur-sm transition-colors duration-300">
          <ToggleButton
            icon={<MacIcon className="w-8 h-8" />}
            label="macOS"
            isActive={isMac}
            onClick={() => setIsMac(true)}
          />
          <ToggleButton
            icon={<WindowsIcon className="w-8 h-8" />}
            label="Windows"
            isActive={!isMac}
            onClick={() => setIsMac(false)}
          />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-heading sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
          Kindly install with {isMac ? "Homebrew on macOS" : "winget on Windows"}
        </h2>
        
        <div className={`transition-all duration-500 ease-in-out ${isMac ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'}`}>
           <MacOSWarning xattrCommand={xattrCommand} />
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="w-full transition-all duration-300 transform">
           <CommandBox command={isMac ? macCommand : winCommand} />
        </div>
      </div>

      {children && <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">{children}</div>}
    </div>
  );
}

function ToggleButton({ icon, label, isActive, onClick }) {
  return (
    <button
      className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all duration-300 font-medium ${
        isActive
          ? "bg-[#FE4C55] text-black shadow-lg shadow-red-500/20"
          : "text-gray-500 dark:text-white hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MacOSWarning({ xattrCommand }) {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-gray-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed transition-colors duration-300">
        Blink Eye is not notarized yet, so you might encounter an error due to
        MacOS Gatekeeper. If you face this issue, follow the{" "}
        <Popover>
          <PopoverTrigger>
            <span className="cursor-pointer text-[#FE4C55] hover:text-[#ff6b73] hover:underline font-medium transition-colors">
              Installation guide
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] sm:w-[400px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-zinc-300 shadow-xl">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-base">
              Bypass Gatekeeper - Installation Instructions:
            </h3>
            <div className="text-sm space-y-3">
              <p>
                <strong className="text-[#FE4C55]">Important Notice</strong>:
                Apple requires developers to pay $100/year for app notarization.
                As a small developer, this cost is significant, so this app has
                not been notarized.
              </p>
              <p>
                As a result, macOS Gatekeeper might block the app. You can
                bypass this restriction using one of the following methods:
              </p>
              <ol className="list-decimal pl-5 space-y-2 marker:text-gray-500 dark:marker:text-zinc-500">
                <li>
                  <strong className="text-gray-900 dark:text-white">Via Finder:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600 dark:text-zinc-400">
                    <li>Right-click the app in Finder.</li>
                    <li>Select "Open" to allow it to run.</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-white">Via Terminal:</strong>
                  <div className="mt-2 text-gray-600 dark:text-zinc-400">
                    Run the following command to remove the Gatekeeper
                    quarantine attribute:
                    <div className="mt-2">
                       <CommandBox command={xattrCommand} small />
                    </div>
                  </div>
                </li>
              </ol>
              <p className="font-medium text-gray-900 dark:text-white mt-4 border-t border-gray-200 dark:border-white/10 pt-3">
                Your understanding and support for independent developers like
                me are greatly appreciated! 💡
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </p>
    </div>
  );
}

function CommandBox({ command, small = false }) {
  return (
    <div className="group relative w-full max-w-2xl mx-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FE4C55]/20 to-[#FE4C55]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className={`relative flex items-center justify-between bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl ${small ? 'p-2' : 'p-4 sm:p-5'} transition-colors group-hover:border-[#FE4C55]/30 shadow-sm`}>
        <code className={`font-mono text-gray-800 dark:text-zinc-300 ${small ? 'text-xs' : 'text-sm sm:text-base'} overflow-x-auto whitespace-nowrap mr-4 hide-scrollbar`}>
          {command}
        </code>
        <div className="shrink-0 pl-4 border-l border-gray-200 dark:border-white/10">
           <CopyButton value={command} className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}

export default Command;
