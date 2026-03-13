import { UserApprovalStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadDocumentVersionForStaff } from "@/lib/documents/service";
import { documentTypeKeySchema } from "@/lib/validation/documents";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to upload documents." }, { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED || session.user.role !== UserRole.STAFF) {
    return NextResponse.json(
      { message: "Only approved staff users can upload case documents." },
      { status: 403 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Upload request must be valid form data." }, { status: 400 });
  }

  const parsedDocumentType = documentTypeKeySchema.safeParse(formData.get("documentTypeKey"));

  if (!parsedDocumentType.success) {
    return NextResponse.json({ message: "Select a valid required document type." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Choose a file to upload." }, { status: 400 });
  }

  const { caseId } = await context.params;
  const result = await uploadDocumentVersionForStaff(
    session.user.id,
    caseId,
    parsedDocumentType.data,
    file
  );

  if (result.status === "uploaded") {
    return NextResponse.json({
      message: "Document uploaded successfully.",
      documentId: result.documentId,
      versionId: result.versionId,
      currentStatusKey: result.currentStatusKey
    });
  }

  if (result.status === "not_found") {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }

  if (result.status === "not_uploadable") {
    return NextResponse.json({ message: result.message }, { status: 409 });
  }

  return NextResponse.json({ message: result.message }, { status: 400 });
}