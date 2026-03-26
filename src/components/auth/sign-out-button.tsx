"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useAppLocale } from "@/components/app/locale-provider";

export function SignOutButton() {
  const { messages } = useAppLocale();

  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })} size="sm" variant="outline">
      <LogOut className="h-4 w-4" />
      {messages.common.signOut}
    </Button>
  );
}
