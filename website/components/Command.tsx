"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CopyButton } from "./copy-button";
import { Switch } from "./ui/switch";

export function Command() {
  const [isMac, setIsMac] = useState(true);
  const macCommand =
    "brew tap nomandhoni-cs/blinkeye && brew install --cask blinkeye";
  const winCommand = "winget install NomanDhoni.BlinkEye";
  const xattrCommand = "xattr -d com.apple.quarantine /path/to/Blink\\ Eye.app";

  return (
    <div className="w-full max-w-3xl mx-auto space-y-1">
      <div className="flex justify-center items-center space-x-4">
        <span className={`text-sm ${!isMac ? "font-bold" : ""}`}>
          Windows
        </span>
        <Switch
          checked={isMac}
          onCheckedChange={setIsMac}
          className="data-[state=checked]:bg-[#FE4C55]"
        />
        <span className={`text-sm ${isMac ? "font-bold" : ""}`}>
          macOS
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-heading">
          For {isMac ? "Homebrew - MacOS" : "Windows"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Install Blink Eye using {isMac ? "Homebrew" : "winget"} with the
          command below:
        </p>
        {isMac && (
          <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
            <p className="mb-2">
              Blink Eye is not notarized yet, so you might encounter an error
              due to MacOS Gatekeeper. If you face this issue, follow
            </p>
            <Popover>
              <PopoverTrigger>
                <span className="cursor-pointer text-[#FE4C55] hover:underline">
                  Installation guide
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white dark:bg-gray-700 border-[#FE4C55] text-gray-800 dark:text-gray-200">
                <h3 className="font-semibold mb-2">
                  Bypass Gatekeeper - Installation Instructions:
                </h3>
                <div className="text-sm space-y-2">
                  <p>
                    <strong className="text-[#FE4C55]">Important Notice</strong>
                    : Apple requires developers to pay $100/year for app
                    notarization. As a small developer, this cost is
                    significant, so this app has not been notarized.
                  </p>
                  <p>
                    As a result, macOS Gatekeeper might block the app. You can
                    bypass this restriction using one of the following methods:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Via Finder:</strong>
                      <ul className="list-disc pl-5">
                        <li>Right-click the app in Finder.</li>
                        <li>Select "Open" to allow it to run.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Via Terminal:</strong>
                      <ul className="list-disc pl-5">
                        <li>
                          Run the following command to remove the Gatekeeper
                          quarantine attribute:
                          <div className="relative mt-2">
                            <div className="absolute -inset-1 bg-[#FE4C55] rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative px-4 py-2 bg-white dark:bg-gray-600 ring-1 ring-[#FE4C55] rounded-lg leading-none flex items-center justify-between space-x-4">
                              <code className="text-gray-800 dark:text-gray-200 font-mono text-xs">
                                {xattrCommand}
                              </code>
                              <CopyButton value={xattrCommand} />
                            </div>
                          </div>
                        </li>
                      </ul>
                    </li>
                  </ol>
                  <p className="font-bold mt-4">
                    Your understanding and support for independent developers
                    like me are greatly appreciated! 💡
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="relative inline-block">
          <div className="absolute -inset-1 bg-[#FE4C55] rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-4 py-3 bg-white dark:bg-gray-700 ring-1 ring-[#FE4C55] rounded-lg leading-none flex items-center space-x-4">
            <code className="text-gray-800 dark:text-gray-200 font-mono text-sm whitespace-nowrap">
              {isMac ? macCommand : winCommand}
            </code>
            <CopyButton value={isMac ? macCommand : winCommand} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Command;
