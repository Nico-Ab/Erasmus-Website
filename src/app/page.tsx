import { auth } from "@/auth";
import { HomePage } from "@/components/home/home-page";

export default async function Page() {
  const session = await auth();

  return <HomePage isAuthenticated={Boolean(session?.user)} userName={session?.user?.name} />;
}
