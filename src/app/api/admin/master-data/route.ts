import { UserApprovalStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createAcademicYear,
  createCaseStatusDefinition,
  createDepartment,
  createFaculty,
  createSelectOption,
  getMasterDataPageData,
  updateAcademicYear,
  updateCaseStatusDefinition,
  updateDepartment,
  updateFaculty,
  updateSelectOption,
  updateUploadSetting
} from "@/lib/master-data/service";
import {
  academicYearSchema,
  caseStatusDefinitionSchema,
  departmentSchema,
  facultySchema,
  selectOptionSchema,
  uploadSettingSchema
} from "@/lib/validation/master-data";

function validationErrorResponse(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  return NextResponse.json(
    {
      message: "Submitted master data is invalid.",
      fieldErrors: error?.flatten().fieldErrors
    },
    { status: 400 }
  );
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to view master data." }, { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Only admins can view master data." }, { status: 403 });
  }

  const data = await getMasterDataPageData();

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to manage master data." }, { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Only admins can change master data." }, { status: 403 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const entity = typeof body.entity === "string" ? body.entity : null;
  const mode = typeof body.mode === "string" ? body.mode : null;
  const id = typeof body.id === "string" ? body.id : null;

  if (!entity || !mode || !["create", "update"].includes(mode)) {
    return NextResponse.json({ message: "Entity and mode are required." }, { status: 400 });
  }

  if (mode === "update" && !id && entity !== "uploadSetting") {
    return NextResponse.json({ message: "Record id is required for updates." }, { status: 400 });
  }

  if (entity === "faculty") {
    const parsed = facultySchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const result =
      mode === "create"
        ? await createFaculty(parsed.data)
        : await updateFaculty(id as string, parsed.data);

    if (result.status === "duplicate") {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }

    if (result.status === "not_found") {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Faculty saved successfully." });
  }

  if (entity === "department") {
    const parsed = departmentSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const result =
      mode === "create"
        ? await createDepartment(parsed.data)
        : await updateDepartment(id as string, parsed.data);

    if (result.status === "duplicate" || result.status === "invalid_faculty") {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }

    if (result.status === "not_found") {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Department saved successfully." });
  }

  if (entity === "academicYear") {
    const parsed = academicYearSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const result =
      mode === "create"
        ? await createAcademicYear(parsed.data)
        : await updateAcademicYear(id as string, parsed.data);

    if (result.status === "duplicate") {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }

    if (result.status === "not_found") {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Academic year saved successfully." });
  }

  if (entity === "status") {
    const parsed = caseStatusDefinitionSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const result =
      mode === "create"
        ? await createCaseStatusDefinition(parsed.data)
        : await updateCaseStatusDefinition(id as string, parsed.data);

    if (result.status === "duplicate") {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }

    if (result.status === "not_found") {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Status definition saved successfully." });
  }

  if (entity === "selectOption") {
    const parsed = selectOptionSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const result =
      mode === "create"
        ? await createSelectOption(parsed.data)
        : await updateSelectOption(id as string, parsed.data);

    if (result.status === "duplicate") {
      return NextResponse.json({ message: result.message }, { status: 409 });
    }

    if (result.status === "not_found") {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ message: "Select-list option saved successfully." });
  }

  if (entity === "uploadSetting") {
    const parsed = uploadSettingSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    await updateUploadSetting(parsed.data);

    return NextResponse.json({ message: "Upload settings saved successfully." });
  }

  return NextResponse.json({ message: "Unsupported master-data entity." }, { status: 400 });
}