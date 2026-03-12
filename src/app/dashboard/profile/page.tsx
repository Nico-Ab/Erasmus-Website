import { notFound } from "next/navigation";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireApprovedAuth } from "@/lib/auth/guards";
import { getEditableProfileData } from "@/lib/profile/service";

export default async function ProfilePage() {
  const session = await requireApprovedAuth();
  const data = await getEditableProfileData(session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Profile status" value="Editable" description="Your own institutional profile can be updated directly from this page." />
        <OverviewMetric title="Faculty" value={data.user.faculty?.name ?? "Unset"} description="Faculty assignment is now linked to admin-managed master data." />
        <OverviewMetric title="Department" value={data.user.department?.name ?? "Unset"} description="Department options stay scoped to the selected faculty." />
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Profile guidance"
          description="These details will feed later case, search, and reporting workflows."
          points={[
            "Keep your name and email aligned with institutional records.",
            "Choose the academic title, faculty, and department that match your current appointment.",
            "Department choices remain tied to the selected faculty to avoid inconsistent assignments.",
            "Changes are validated on the server before they are saved."
          ]}
        />
        <ProfileForm
          initialValues={{
            firstName: data.user.firstName ?? "",
            lastName: data.user.lastName ?? "",
            email: data.user.email,
            academicTitleOptionId: data.user.academicTitleOptionId ?? "",
            facultyId: data.user.facultyId ?? "",
            departmentId: data.user.departmentId ?? ""
          }}
          academicTitleOptions={data.academicTitleOptions}
          faculties={data.faculties}
        />
      </section>
    </div>
  );
}