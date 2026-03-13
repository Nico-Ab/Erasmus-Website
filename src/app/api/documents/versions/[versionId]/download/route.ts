import { UserApprovalStatus } from "@prisma/client";
import { auth } from "@/auth";
import { authorizeDocumentDownload } from "@/lib/documents/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    versionId: string;
  }>;
};

function buildContentDisposition(filename: string) {
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Sign in to download documents.", { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED) {
    return new Response("Only approved users can download documents.", { status: 403 });
  }

  const { versionId } = await context.params;
  const result = await authorizeDocumentDownload(session.user.id, session.user.role, versionId);

  if (result.status !== "ready") {
    if (result.status === "not_found") {
      return new Response("Document not found.", { status: 404 });
    }

    return new Response("Document file is missing from storage.", { status: 410 });
  }

  return new Response(new Uint8Array(result.file), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": buildContentDisposition(result.filename),
      "Content-Length": result.file.byteLength.toString(),
      "Content-Type": result.mimeType ?? "application/octet-stream"
    }
  });
}