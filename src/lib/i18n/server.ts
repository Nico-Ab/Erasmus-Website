import { cookies } from "next/headers";
import { appLocaleCookieName, resolveAppLocale } from "@/lib/i18n/config";

export async function getRequestLocale() {
  const cookieStore = await cookies();

  return resolveAppLocale(cookieStore.get(appLocaleCookieName)?.value);
}
