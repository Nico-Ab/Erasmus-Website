import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ReportingData } from "@/lib/reporting/service";

type ReportFiltersProps = {
  data: ReportingData;
};

export function ReportFilters({ data }: ReportFiltersProps) {
  return (
    <form className="space-y-4 rounded-xl border border-slate-200 bg-white/95 p-5" data-testid="report-filters" method="get">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Reporting filters</h2>
        <p className="mt-1 text-sm text-slate-600">
          Filter reports server-side by academic context, assignment, host details, and workflow status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="academicYearId">Academic year</Label>
          <Select defaultValue={data.filters.academicYearId} id="academicYearId" name="academicYearId">
            <option value="">All academic years</option>
            {data.filterOptions.academicYears.map((academicYear) => (
              <option key={academicYear.id} value={academicYear.id}>
                {academicYear.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="facultyId">Faculty</Label>
          <Select defaultValue={data.filters.facultyId} id="facultyId" name="facultyId">
            <option value="">All faculties</option>
            {data.filterOptions.faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select defaultValue={data.filters.departmentId} id="departmentId" name="departmentId">
            <option value="">All departments</option>
            {data.filterOptions.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobilityTypeOptionId">Mobility type</Label>
          <Select defaultValue={data.filters.mobilityTypeOptionId} id="mobilityTypeOptionId" name="mobilityTypeOptionId">
            <option value="">All mobility types</option>
            {data.filterOptions.mobilityTypes.map((mobilityType) => (
              <option key={mobilityType.id} value={mobilityType.id}>
                {mobilityType.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input defaultValue={data.filters.country} id="country" name="country" placeholder="Host country" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hostInstitution">Host institution</Label>
          <Input defaultValue={data.filters.hostInstitution} id="hostInstitution" name="hostInstitution" placeholder="Host institution" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="statusDefinitionId">Status</Label>
          <Select defaultValue={data.filters.statusDefinitionId} id="statusDefinitionId" name="statusDefinitionId">
            <option value="">All statuses</option>
            {data.filterOptions.statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">Apply filters</Button>
        <Button asChild type="button" variant="outline">
          <Link href="/dashboard/reports">Clear filters</Link>
        </Button>
      </div>
    </form>
  );
}