import { auth } from "@/auth";
import { HomePage } from "@/components/home/home-page";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function Page() {
  const session = await auth();
  const locale = await getRequestLocale();

  return <HomePage isAuthenticated={Boolean(session?.user)} locale={locale} userName={session?.user?.name} />;
}
