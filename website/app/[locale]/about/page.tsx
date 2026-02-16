import { routing } from "@/i18n/routing";
import Features from "../features/page";
import HowToUse from "../howtouse/page";
import Privacy from "../privacy/page";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { SEO } from "@/configs/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const appInfo = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: `${t("title")} | ${appInfo("appName")}`,
    description: t("description"),
    openGraph: {
      title: `${t("title")} | ${appInfo("appName")}`,
      description: t("description"),
      type: "website",
    },
  };
}

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-heading mb-4 text-center">Blink Eye</h1>
        <p className="text-lg mb-6">
          Blink Eye is a minimalist eye-care reminder app designed to reduce eye
          strain during extended screen usage. It also can be used as a break
          time reminder app. It provides customizable timers, full-screen
          popups, audio mute functionality, and a suite of additional features
          for a seamless user experience.
        </p>

        <h2 className="text-3xl font-semibold mb-4">Features</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Customizable reminder timers.</li>
          <li>Rich library of customizable reminder screens.</li>
          <li>
            Full-screen popups with a 20-second countdown to prompt users to
            look away.
          </li>
          <li>Customizable dashboard for settings and preferences.</li>
          <li>
            Usage time tracking: view daily, weekly, and lifetime usage stats.
          </li>
          <li>All future feature updates based on community feedback.</li>
          <li>
            Multilingual support.{" "}
            <span className="text-sm text-gray-500">[Soon]</span>
          </li>
          <li>
            Audio mute during reminders to enhance focus.{" "}
            <span className="text-sm text-gray-500">[Soon]</span>
          </li>
          <li>
            Workday setup: specify worktime when reminders should show.{" "}
            <span className="text-sm text-gray-500">[Soon]</span>
          </li>
        </ul>

        <h2 className="text-3xl font-semibold mt-8 mb-4">Quick Access Links</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <Link
              href="https://github.com/nomandhoni-cs/blink-eye"
              className="text-primary hover:underline"
            >
              GitHub Repository
            </Link>
          </li>
          <li>
            <Link href={SEO.url} className="text-primary hover:underline">
              Official Website
            </Link>
          </li>
        </ul>

        <h2 className="text-3xl font-semibold mt-8 mb-4">The 20-20-20 Rule</h2>
        <p className="text-lg mb-6">
          The 20-20-20 rule is a guideline to reduce eye strain caused by
          staring at screens for extended periods. It suggests that for every 20
          minutes spent looking at a screen, you should take a 20-second break
          and focus your eyes on something at least 20 feet away.
        </p>

        <h3 className="text-2xl font-bold mb-4">Benefits</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>Reduces Eye Strain:</strong> Regular breaks help prevent eye
            fatigue and strain caused by prolonged screen time.
          </li>
          <li>
            <strong>Improves Focus:</strong> Taking short breaks can help
            maintain focus and productivity throughout the day.
          </li>
          <li>
            <strong>Prevents Dry Eyes:</strong> Looking away from the screen
            allows your eyes to blink more frequently, reducing the risk of dry
            eyes.
          </li>
          <li>
            <strong>Promotes Eye Health:</strong> Focusing on distant objects
            helps relax eye muscles and reduce the risk of developing
            vision-related issues.
          </li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4">How Blink Eye Helps</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>Boosts Productivity:</strong> By reminding users to take
            breaks, Blink Eye helps maintain high levels of focus and
            motivation. Short breaks lead to better mental clarity and energy,
            making it easier to tackle tasks efficiently.
          </li>
          <li>
            <strong>Increases Workflow Efficiency:</strong> With the break time
            reminder feature, Blink Eye ensures you're working in manageable
            intervals, reducing burnout and fatigue. It can help optimize your
            work routine by encouraging timely rest periods.
          </li>
          <li>
            <strong>Encourages Healthy Habits:</strong> Establishing a routine
            of taking regular breaks fosters a healthier work-life balance and
            prevents overexertion, improving your overall well-being.
          </li>
          <li>
            <strong>Customizable Break Times:</strong> Set your own intervals
            and break lengths to match your personal productivity style, making
            Blink Eye a versatile tool for users with different work schedules.
          </li>
          <li>
            <strong>Time Management Tool:</strong> Blink Eye can double as a
            productivity tool by encouraging structured break times, enhancing
            time management for both work and personal tasks.
          </li>
        </ul>
      </div>

      <Features params={params} />
      <HowToUse params={params} />
      <Privacy params={params} />
    </div>
  );
}
