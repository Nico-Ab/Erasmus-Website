"use client";

import { SelectOptionCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatStatusLabel } from "@/lib/utils";

type MasterDataManagerProps = {
  faculties: Array<{
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    departments: Array<{
      id: string;
      code: string;
      name: string;
      isActive: boolean;
      facultyId: string;
    }>;
  }>;
  departments: Array<{
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    facultyId: string;
    faculty: {
      id: string;
      name: string;
    };
  }>;
  academicYears: Array<{
    id: string;
    label: string;
    startYear: number;
    endYear: number;
    sortOrder: number;
    isActive: boolean;
  }>;
  statuses: Array<{
    id: string;
    key: string;
    label: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
  }>;
  selectOptions: Array<{
    id: string;
    category: SelectOptionCategory;
    key: string;
    label: string;
    sortOrder: number;
    isActive: boolean;
  }>;
  uploadSetting: {
    id: string;
    maxUploadSizeMb: number;
    allowedExtensions: string;
  };
  uploadEnvironmentBounds: {
    maxUploadSizeMb: number;
    allowedExtensions: string[];
  };
};

type SectionKey =
  | "faculties"
  | "departments"
  | "academicYears"
  | "statuses"
  | "selectOptions"
  | "uploadSettings";

function readText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function readBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function readNumber(formData: FormData, name: string) {
  return Number(readText(formData, name));
}

function SectionNotice({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      {message}
    </div>
  );
}

function SectionShell({
  title,
  description,
  children,
  notice,
  sectionId
}: {
  title: string;
  description: string;
  children: ReactNode;
  notice?: string | null;
  sectionId: SectionKey;
}) {
  return (
    <Card className="border-slate-200 bg-white/95" data-section={sectionId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SectionNotice message={notice} />
        {children}
      </CardContent>
    </Card>
  );
}

function CheckboxField({
  id,
  label,
  defaultChecked = false
}: {
  id: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700" htmlFor={id}>
      <input defaultChecked={defaultChecked} id={id} name={id} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function formatCategoryLabel(category: SelectOptionCategory) {
  return formatStatusLabel(category);
}

export function MasterDataManager({
  faculties,
  departments,
  academicYears,
  statuses,
  selectOptions,
  uploadSetting,
  uploadEnvironmentBounds
}: MasterDataManagerProps) {
  const router = useRouter();
  const [notices, setNotices] = useState<Record<SectionKey, string | null>>({
    faculties: null,
    departments: null,
    academicYears: null,
    statuses: null,
    selectOptions: null,
    uploadSettings: null
  });
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  async function submitPayload(section: SectionKey, payload: Record<string, unknown>) {
    setNotices((current) => ({ ...current, [section]: null }));
    setActiveSection(section);

    const response = await fetch("/api/admin/master-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = await response.json().catch(() => null);

    setActiveSection(null);

    if (!response.ok) {
      setNotices((current) => ({
        ...current,
        [section]: body?.message ?? "The record could not be saved."
      }));
      return false;
    }

    router.refresh();
    return true;
  }

  return (
    <div className="space-y-6">
      <SectionShell
        title="Faculties"
        description="Manage the institutional faculty list used in staff profiles and later filtering surfaces."
        notice={notices.faculties}
        sectionId="faculties"
      >
        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const saved = await submitPayload("faculties", {
              entity: "faculty",
              mode: "create",
              code: readText(formData, "createFacultyCode"),
              name: readText(formData, "createFacultyName"),
              isActive: true
            });

            if (saved) {
              event.currentTarget.reset();
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="createFacultyCode">Faculty code</Label>
            <Input id="createFacultyCode" name="createFacultyCode" placeholder="ECON" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createFacultyName">Faculty name</Label>
            <Input id="createFacultyName" name="createFacultyName" placeholder="Faculty of Economics" />
          </div>
          <Button disabled={activeSection === "faculties"} type="submit">
            {activeSection === "faculties" ? "Saving..." : "Add faculty"}
          </Button>
        </form>
        <div className="space-y-3">
          {faculties.map((faculty) => (
            <form
              key={faculty.id}
              className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[180px_1fr_auto_auto] md:items-end"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await submitPayload("faculties", {
                  entity: "faculty",
                  mode: "update",
                  id: faculty.id,
                  code: readText(formData, `facultyCode-${faculty.id}`),
                  name: readText(formData, `facultyName-${faculty.id}`),
                  isActive: readBoolean(formData, `facultyActive-${faculty.id}`)
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={`facultyCode-${faculty.id}`}>Faculty code</Label>
                <Input defaultValue={faculty.code} id={`facultyCode-${faculty.id}`} name={`facultyCode-${faculty.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`facultyName-${faculty.id}`}>Faculty name</Label>
                <Input defaultValue={faculty.name} id={`facultyName-${faculty.id}`} name={`facultyName-${faculty.id}`} />
              </div>
              <div className="pb-2">
                <CheckboxField
                  defaultChecked={faculty.isActive}
                  id={`facultyActive-${faculty.id}`}
                  label="Active"
                />
              </div>
              <Button disabled={activeSection === "faculties"} type="submit" variant="outline">
                Save faculty
              </Button>
            </form>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Departments"
        description="Department records stay linked to a faculty so profile data remains structurally consistent."
        notice={notices.departments}
        sectionId="departments"
      >
        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[220px_180px_1fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const saved = await submitPayload("departments", {
              entity: "department",
              mode: "create",
              facultyId: readText(formData, "createDepartmentFacultyId"),
              code: readText(formData, "createDepartmentCode"),
              name: readText(formData, "createDepartmentName"),
              isActive: true
            });

            if (saved) {
              event.currentTarget.reset();
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="createDepartmentFacultyId">Faculty</Label>
            <Select id="createDepartmentFacultyId" name="createDepartmentFacultyId">
              <option value="">Select faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="createDepartmentCode">Department code</Label>
            <Input id="createDepartmentCode" name="createDepartmentCode" placeholder="INTL_RELATIONS" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createDepartmentName">Department name</Label>
            <Input id="createDepartmentName" name="createDepartmentName" placeholder="International Relations" />
          </div>
          <Button disabled={activeSection === "departments"} type="submit">
            {activeSection === "departments" ? "Saving..." : "Add department"}
          </Button>
        </form>
        <div className="space-y-3">
          {departments.map((department) => (
            <form
              key={department.id}
              className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[220px_180px_1fr_auto_auto] md:items-end"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await submitPayload("departments", {
                  entity: "department",
                  mode: "update",
                  id: department.id,
                  facultyId: readText(formData, `departmentFacultyId-${department.id}`),
                  code: readText(formData, `departmentCode-${department.id}`),
                  name: readText(formData, `departmentName-${department.id}`),
                  isActive: readBoolean(formData, `departmentActive-${department.id}`)
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={`departmentFacultyId-${department.id}`}>Faculty</Label>
                <Select defaultValue={department.facultyId} id={`departmentFacultyId-${department.id}`} name={`departmentFacultyId-${department.id}`}>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`departmentCode-${department.id}`}>Department code</Label>
                <Input defaultValue={department.code} id={`departmentCode-${department.id}`} name={`departmentCode-${department.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`departmentName-${department.id}`}>Department name</Label>
                <Input defaultValue={department.name} id={`departmentName-${department.id}`} name={`departmentName-${department.id}`} />
              </div>
              <div className="pb-2">
                <CheckboxField
                  defaultChecked={department.isActive}
                  id={`departmentActive-${department.id}`}
                  label="Active"
                />
              </div>
              <Button disabled={activeSection === "departments"} type="submit" variant="outline">
                Save department
              </Button>
            </form>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Academic years"
        description="Maintain the year list that later case forms and reports will reference."
        notice={notices.academicYears}
        sectionId="academicYears"
      >
        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_120px_120px_120px_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const saved = await submitPayload("academicYears", {
              entity: "academicYear",
              mode: "create",
              label: readText(formData, "createAcademicYearLabel"),
              startYear: readNumber(formData, "createAcademicYearStartYear"),
              endYear: readNumber(formData, "createAcademicYearEndYear"),
              sortOrder: readNumber(formData, "createAcademicYearSortOrder"),
              isActive: true
            });

            if (saved) {
              event.currentTarget.reset();
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="createAcademicYearLabel">Label</Label>
            <Input id="createAcademicYearLabel" name="createAcademicYearLabel" placeholder="2027/2028" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createAcademicYearStartYear">Start year</Label>
            <Input id="createAcademicYearStartYear" name="createAcademicYearStartYear" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createAcademicYearEndYear">End year</Label>
            <Input id="createAcademicYearEndYear" name="createAcademicYearEndYear" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createAcademicYearSortOrder">Sort order</Label>
            <Input id="createAcademicYearSortOrder" name="createAcademicYearSortOrder" type="number" />
          </div>
          <Button disabled={activeSection === "academicYears"} type="submit">
            {activeSection === "academicYears" ? "Saving..." : "Add academic year"}
          </Button>
        </form>
        <div className="space-y-3">
          {academicYears.map((academicYear) => (
            <form
              key={academicYear.id}
              className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[180px_120px_120px_120px_auto_auto] md:items-end"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await submitPayload("academicYears", {
                  entity: "academicYear",
                  mode: "update",
                  id: academicYear.id,
                  label: readText(formData, `academicYearLabel-${academicYear.id}`),
                  startYear: readNumber(formData, `academicYearStartYear-${academicYear.id}`),
                  endYear: readNumber(formData, `academicYearEndYear-${academicYear.id}`),
                  sortOrder: readNumber(formData, `academicYearSortOrder-${academicYear.id}`),
                  isActive: readBoolean(formData, `academicYearActive-${academicYear.id}`)
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={`academicYearLabel-${academicYear.id}`}>Label</Label>
                <Input defaultValue={academicYear.label} id={`academicYearLabel-${academicYear.id}`} name={`academicYearLabel-${academicYear.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`academicYearStartYear-${academicYear.id}`}>Start year</Label>
                <Input defaultValue={academicYear.startYear} id={`academicYearStartYear-${academicYear.id}`} name={`academicYearStartYear-${academicYear.id}`} type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`academicYearEndYear-${academicYear.id}`}>End year</Label>
                <Input defaultValue={academicYear.endYear} id={`academicYearEndYear-${academicYear.id}`} name={`academicYearEndYear-${academicYear.id}`} type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`academicYearSortOrder-${academicYear.id}`}>Sort order</Label>
                <Input defaultValue={academicYear.sortOrder} id={`academicYearSortOrder-${academicYear.id}`} name={`academicYearSortOrder-${academicYear.id}`} type="number" />
              </div>
              <div className="pb-2">
                <CheckboxField
                  defaultChecked={academicYear.isActive}
                  id={`academicYearActive-${academicYear.id}`}
                  label="Active"
                />
              </div>
              <Button disabled={activeSection === "academicYears"} type="submit" variant="outline">
                Save academic year
              </Button>
            </form>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Statuses"
        description="Maintain the case-status list that later workflow transitions and reporting will use."
        notice={notices.statuses}
        sectionId="statuses"
      >
        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[160px_220px_120px_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const saved = await submitPayload("statuses", {
              entity: "status",
              mode: "create",
              key: readText(formData, "createStatusKey"),
              label: readText(formData, "createStatusLabel"),
              description: null,
              sortOrder: readNumber(formData, "createStatusSortOrder"),
              isActive: true
            });

            if (saved) {
              event.currentTarget.reset();
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="createStatusKey">Status key</Label>
            <Input id="createStatusKey" name="createStatusKey" placeholder="under_review" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createStatusLabel">Status label</Label>
            <Input id="createStatusLabel" name="createStatusLabel" placeholder="Under Review" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createStatusSortOrder">Sort order</Label>
            <Input id="createStatusSortOrder" name="createStatusSortOrder" type="number" />
          </div>
          <Button disabled={activeSection === "statuses"} type="submit">
            {activeSection === "statuses" ? "Saving..." : "Add status"}
          </Button>
        </form>
        <div className="space-y-3">
          {statuses.map((status) => (
            <form
              key={status.id}
              className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[160px_220px_120px_auto_auto] md:items-end"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await submitPayload("statuses", {
                  entity: "status",
                  mode: "update",
                  id: status.id,
                  key: readText(formData, `statusKey-${status.id}`),
                  label: readText(formData, `statusLabel-${status.id}`),
                  description: null,
                  sortOrder: readNumber(formData, `statusSortOrder-${status.id}`),
                  isActive: readBoolean(formData, `statusActive-${status.id}`)
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={`statusKey-${status.id}`}>Status key</Label>
                <Input defaultValue={status.key} id={`statusKey-${status.id}`} name={`statusKey-${status.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`statusLabel-${status.id}`}>Status label</Label>
                <Input defaultValue={status.label} id={`statusLabel-${status.id}`} name={`statusLabel-${status.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`statusSortOrder-${status.id}`}>Sort order</Label>
                <Input defaultValue={status.sortOrder} id={`statusSortOrder-${status.id}`} name={`statusSortOrder-${status.id}`} type="number" />
              </div>
              <div className="pb-2">
                <CheckboxField defaultChecked={status.isActive} id={`statusActive-${status.id}`} label="Active" />
              </div>
              <Button disabled={activeSection === "statuses"} type="submit" variant="outline">
                Save status
              </Button>
            </form>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Select-list data"
        description="Maintain option lists needed by v1, including academic titles, mobility types, and document types."
        notice={notices.selectOptions}
        sectionId="selectOptions"
      >
        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[200px_160px_220px_120px_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const saved = await submitPayload("selectOptions", {
              entity: "selectOption",
              mode: "create",
              category: readText(formData, "createSelectOptionCategory"),
              key: readText(formData, "createSelectOptionKey"),
              label: readText(formData, "createSelectOptionLabel"),
              sortOrder: readNumber(formData, "createSelectOptionSortOrder"),
              isActive: true
            });

            if (saved) {
              event.currentTarget.reset();
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="createSelectOptionCategory">Category</Label>
            <Select id="createSelectOptionCategory" name="createSelectOptionCategory">
              <option value={SelectOptionCategory.ACADEMIC_TITLE}>Academic Title</option>
              <option value={SelectOptionCategory.MOBILITY_TYPE}>Mobility Type</option>
              <option value={SelectOptionCategory.DOCUMENT_TYPE}>Document Type</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="createSelectOptionKey">Key</Label>
            <Input id="createSelectOptionKey" name="createSelectOptionKey" placeholder="prof" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createSelectOptionLabel">Label</Label>
            <Input id="createSelectOptionLabel" name="createSelectOptionLabel" placeholder="Prof." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="createSelectOptionSortOrder">Sort order</Label>
            <Input id="createSelectOptionSortOrder" name="createSelectOptionSortOrder" type="number" />
          </div>
          <Button disabled={activeSection === "selectOptions"} type="submit">
            {activeSection === "selectOptions" ? "Saving..." : "Add option"}
          </Button>
        </form>
        <div className="space-y-3">
          {selectOptions.map((option) => (
            <form
              key={option.id}
              className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[200px_160px_220px_120px_auto_auto] md:items-end"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await submitPayload("selectOptions", {
                  entity: "selectOption",
                  mode: "update",
                  id: option.id,
                  category: readText(formData, `selectOptionCategory-${option.id}`),
                  key: readText(formData, `selectOptionKey-${option.id}`),
                  label: readText(formData, `selectOptionLabel-${option.id}`),
                  sortOrder: readNumber(formData, `selectOptionSortOrder-${option.id}`),
                  isActive: readBoolean(formData, `selectOptionActive-${option.id}`)
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor={`selectOptionCategory-${option.id}`}>Category</Label>
                <Select defaultValue={option.category} id={`selectOptionCategory-${option.id}`} name={`selectOptionCategory-${option.id}`}>
                  <option value={SelectOptionCategory.ACADEMIC_TITLE}>Academic Title</option>
                  <option value={SelectOptionCategory.MOBILITY_TYPE}>Mobility Type</option>
                  <option value={SelectOptionCategory.DOCUMENT_TYPE}>Document Type</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`selectOptionKey-${option.id}`}>Key</Label>
                <Input defaultValue={option.key} id={`selectOptionKey-${option.id}`} name={`selectOptionKey-${option.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`selectOptionLabel-${option.id}`}>Label</Label>
                <Input defaultValue={option.label} id={`selectOptionLabel-${option.id}`} name={`selectOptionLabel-${option.id}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`selectOptionSortOrder-${option.id}`}>Sort order</Label>
                <Input defaultValue={option.sortOrder} id={`selectOptionSortOrder-${option.id}`} name={`selectOptionSortOrder-${option.id}`} type="number" />
              </div>
              <div className="pb-2">
                <CheckboxField defaultChecked={option.isActive} id={`selectOptionActive-${option.id}`} label="Active" />
              </div>
              <Button disabled={activeSection === "selectOptions"} type="submit" variant="outline">
                Save option
              </Button>
            </form>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Current categories in use</p>
          <p className="mt-2">
            {Array.from(new Set(selectOptions.map((option) => option.category)))
              .map((category) => formatCategoryLabel(category))
              .join(", ")}
          </p>
        </div>
      </SectionShell>

      <SectionShell
        title="Upload settings"
        description="Edit the operational upload policy while staying inside the environment hard limits."
        notice={notices.uploadSettings}
        sectionId="uploadSettings"
      >
        <form
          className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[180px_1fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            await submitPayload("uploadSettings", {
              entity: "uploadSetting",
              mode: "update",
              maxUploadSizeMb: readNumber(formData, "uploadMaxUploadSizeMb"),
              allowedExtensions: readText(formData, "uploadAllowedExtensions")
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="uploadMaxUploadSizeMb">Maximum upload size (MB)</Label>
            <Input defaultValue={uploadSetting.maxUploadSizeMb} id="uploadMaxUploadSizeMb" name="uploadMaxUploadSizeMb" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uploadAllowedExtensions">Allowed extensions</Label>
            <Input defaultValue={uploadSetting.allowedExtensions} id="uploadAllowedExtensions" name="uploadAllowedExtensions" placeholder="pdf,doc,docx" />
          </div>
          <Button disabled={activeSection === "uploadSettings"} type="submit" variant="outline">
            {activeSection === "uploadSettings" ? "Saving..." : "Save upload settings"}
          </Button>
        </form>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Environment hard limits</p>
          <p className="mt-2">Maximum upload size cap: {uploadEnvironmentBounds.maxUploadSizeMb} MB</p>
          <p className="mt-1">Allowed extension allowlist: {uploadEnvironmentBounds.allowedExtensions.join(", ")}</p>
        </div>
      </SectionShell>
    </div>
  );
}