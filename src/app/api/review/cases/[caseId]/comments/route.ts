import { NextResponse } from "next/server";
import { requireApprovedReviewSession } from "@/lib/auth/api-guards";
import { createReviewCaseComment } from "@/lib/review-workflow/service";
import { reviewCaseCommentSchema } from "@/lib/validation/review-workflow";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await requireApprovedReviewSession();

  if (session instanceof NextResponse) {
    return session;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = reviewCaseCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Comment details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { caseId } = await context.params;
  const result = await createReviewCaseComment(session.user.id, caseId, parsed.data.body);

  if (result.status === "created") {
    return NextResponse.json({ message: "Comment added successfully." }, { status: 201 });
  }

  return NextResponse.json({ message: result.message }, { status: 404 });
}