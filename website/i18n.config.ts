import { getRequestConfig } from "next-intl/server";
import { locales } from "@/configs/site";

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
