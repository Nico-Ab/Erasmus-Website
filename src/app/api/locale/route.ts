import { NextResponse } from "next/server";
import { appLocaleCookieName, resolveAppLocale } from "@/lib/i18n/config";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const requestedLocale =
    body && typeof body === "object" && "locale" in body ? String(body.locale) : "";
  const locale = resolveAppLocale(requestedLocale);
  const response = NextResponse.json({ locale });

  response.cookies.set({
    name: appLocaleCookieName,
    value: locale,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return response;
}
