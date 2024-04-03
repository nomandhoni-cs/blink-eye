import { CopyButton } from "@/components/copy-button";
import { CONFIG } from "@/configs/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How To Use",
};
const HowToUse = () => {
  return (
    <div className="mb-8 container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">
        How to Use
      </h2>
      <ol className="list-decimal ml-6 py-5 flex flex-col gap-8">
        <li>Download the Installer from Home Page</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          Skip the warnings may raised by Windows SmartScreen Filter. Click on the three-dot, <code>Keep</code>. In new pop-up clink <code>Show more</code> dropdown menu and click on <code>Keep anyway</code>.
        </pre>
        <li>Run the Installer</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          Skip the warnings may raised by Windows SmartScreen Filter in this case also. Click on More Info and then Run Anyway.
          <li>Follow the On-Screen instruction</li>
          <li>Finish the Installation</li>
        </pre>
        Yay!!! You've installed Blink Eye!!! From now on, you'll be shown a Break Window on 20 minutes interval and will stay for 20 seconds!
        Keep your eyes healthy with Blink Eye!
      </ol>

      <h2 className="text-2xl font-bold mb-4">
        How to build the the application by yourself
      </h2>
      <ol className="list-decimal ml-6 py-5 flex flex-col gap-8">
        <li>Clone the repository:</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            git clone https://github.com/nomandhoni-cs/blink-eye.git
          </code>

          <CopyButton
            value={`git clone https://github.com/nomandhoni-cs/blink-eye.git`}
          />
        </pre>
        <li>Change the working directory:</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            cd blink-eye/application
          </code>

          <CopyButton
            value={`cd blink-eye/application`}
          />
        </pre>
        <li>Create and activate a virtual environment (optional):</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            python -m venv .venv && .\.venv\Scripts\Activate.bat
          </code>

          <CopyButton
            value={`python -m venv .venv && .\.venv\Scripts\Activate.bat`}
          />
        </pre>
        <li>Install the dependencies:</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            pip install -r REQUIREMENTS.txt
          </code>

          <CopyButton value={`pip install -r REQUIREMENTS.txt`} />
        </pre>
        <li>Run the application:</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            python blink-eye.py
          </code>

          <CopyButton value={`python blink-eye.py`} />
        </pre>
        <li>Make the <code>.exe</code> yourself:</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            pyinstaller --name BlinkEye --onefile --windowed --icon="./Assets/blink-eye-logo.ico" --add-data="./Assets/*;./Assets" --hidden-import plyer.platforms.win.notification --clean blink-eye.py
          </code>
          Copy the <code>.exe</code> from <code>/application/dist</code> to <code>/application</code> in order to run that, as it requires the access <code>/application/Assets</code> directory.

          <CopyButton value={`pyinstaller --name BlinkEye --onefile --windowed --icon="./Assets/blink-eye-logo.ico" --add-data="./Assets/*;./Assets" --hidden-import plyer.platforms.win.notification --clean blink-eye.py`} />
        </pre>
        <li>Build the software yourself (Recommended):</li>
        <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
          <code className="font-mono text-sm font-semibold">
            build_windows.bat
          </code>

          <CopyButton value={`build_windows.bat`} />
        </pre>
      </ol>
    </div>
  );
};

export default HowToUse;
