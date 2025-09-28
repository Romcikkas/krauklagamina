import { getRequestConfig } from "next-intl/server";

// Palaikomos kalbos
export const locales = ["lt", "pl", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "lt";

export default getRequestConfig(async ({ locale }) => {
  // Use defaultLocale if invalid locale is provided
  const validLocale = (
    locale && locales.includes(locale as Locale) ? locale : defaultLocale
  ) as Locale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
