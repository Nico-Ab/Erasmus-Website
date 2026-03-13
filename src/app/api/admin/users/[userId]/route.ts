import { NextResponse } from "next/server";
import { requireApprovedAdminSession } from "@/lib/auth/api-guards";
import { applyAdminUserAction } from "@/lib/admin/service";
import { adminUserActionSchema } from "@/lib/validation/admin-users";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApprovedAdminSession();

  if (session instanceof NextResponse) {
    return session;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = adminUserActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "User action details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { userId } = await context.params;
  const result = await applyAdminUserAction({
    adminUserId: session.user.id,
    userId,
    input: parsed.data
  });

  if (result.status === "updated") {
    return NextResponse.json({ message: result.message });
  }

  if (result.status === "not_found") {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }

  if (result.status === "no_change") {
    return NextResponse.json({ message: result.message }, { status: 409 });
  }

  if (result.status === "self_forbidden") {
    return NextResponse.json({ message: result.message }, { status: 403 });
  }

  return NextResponse.json({ message: result.message }, { status: 400 });
}