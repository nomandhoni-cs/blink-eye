import Contributors from "@/components/contributors";
import DownloadApp from "@/components/download-app";
import OpenSource from "@/components/open-source";

const RootPage = () => {
  return (
    <section className="mx-auto flex flex-col items-center gap-8 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] max-w-sm md:max-w-3xl">
        <span className="font-bold text-[#FE4C55]"> Blink Eye </span> A
        minimalist eye care reminder app.
      </h1>

      <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
        To reduce eye strain, featuring reminder with timers, full-screen
        popups.
      </p>

      <div className="flex flex-col gap-4">
        <DownloadApp />
        <OpenSource />
        <Contributors />
      </div>
    </section>
  );
};

export default RootPage;

// import { CopyButton } from "@/components/copy-button";
// import { Button } from "@/components/ui/button";
// import { CONFIG } from "@/configs/site";
// import Link from "next/link";
{
  /* <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
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
</div> */
}

{
  /* <pre className="hidden h-11 overflow-y-hidden items-center justify-between space-x-2 overflow-x-auto rounded border pl-6 pr-2 md:flex">
  <code className="font-mono text-sm font-semibold">
    {`${CONFIG.command} ${CONFIG.repository}`}
  </code>

  <CopyButton value={`${CONFIG.command} ${CONFIG.repository}`} />
</pre> */
}
