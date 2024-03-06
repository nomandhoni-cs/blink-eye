import { CONFIG } from "@/configs/site";
import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";

const RootPage = () => {
  return (
    <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] max-w-sm md:max-w-3xl">
        <span className="font-bold text-[#FE4C55]"> Blink Eye: </span> A
        minimalist eye care reminder app
      </h1>

      <span className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
        to reduce eye strain, featuring customizable timers, full-screen popups,
        audio mute.
      </span>

      <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
        <Button size="sm" asChild>
          <Link href={CONFIG.repository} target="_blank" rel="noreferrer">
            Visit Repository
          </Link>
        </Button>

        <Button size="sm" variant="outline" asChild>
          <Link href={CONFIG.documentation} target="_blank" rel="noreferrer">
            All Components
          </Link>
        </Button>
      </div>

      <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
        <code className="font-mono text-sm font-semibold">
          {`${CONFIG.command} ${CONFIG.repository}`}
        </code>

        <CopyButton value={`${CONFIG.command} ${CONFIG.repository}`} />
      </pre>
    </section>
  );
};

export default RootPage;
