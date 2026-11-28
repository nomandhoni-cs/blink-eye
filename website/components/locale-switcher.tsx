"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ScrollArea } from "./ui/scroll-area";

export function LocaleToggle() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    if (!pathname) return;

    // Get the current path segments after the locale
    const pathSegments = pathname.split("/").slice(2);
    // Blog posts and release notes exist only in English. Switching locales
    // from one of these routes returns to the selected locale's home page.
    const englishOnlySections = ["blogs", "posts", "changelog"];
    const newPath = englishOnlySections.includes(pathSegments[0])
      ? `/${newLocale}`
      : `/${newLocale}/${pathSegments.join("/")}`;
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <ScrollArea className="h-[400px]">
          {routing.locales.map((cur) => (
            <DropdownMenuItem
              key={cur}
              onClick={() => handleLocaleChange(cur)}
              className={cur === locale ? "bg-accent" : ""}
            >
              {t(`locale.${cur}`)}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
