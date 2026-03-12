import { NextResponse } from "next/server";
import { registerStaffUser } from "@/lib/auth/service";
import { registrationSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Registration details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const result = await registerStaffUser(parsed.data);

  if (result.status === "email_in_use") {
    return NextResponse.json(
      { message: "An account with this email already exists.", code: result.status },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { status: result.status, email: result.email },
    { status: 201 }
  );
}