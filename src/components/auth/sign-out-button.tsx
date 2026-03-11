"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })} size="sm" variant="outline">
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
