import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
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
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My profile" }
        ]}
        description="Review and update the institutional identity details used in case ownership, review, and reporting."
        eyebrow="Profile administration"
        title="Editable staff profile"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Profile status" value="Editable" description="Your own institutional profile can be updated directly from this page." />
        <OverviewMetric title="Faculty" value={data.user.faculty?.name ?? "Unset"} description="Faculty assignment is linked to admin-managed master data." />
        <OverviewMetric title="Department" value={data.user.department?.name ?? "Unset"} description="Department options stay scoped to the selected faculty." />
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Profile guidance"
          description="These details support mobility case ownership, search filters, and reporting outputs."
          points={[
            "Keep your name and email aligned with university records.",
            "Choose the academic title, faculty, and department that match your current appointment.",
            "Department choices remain tied to the selected faculty to prevent inconsistent assignments.",
            "Profile changes are validated on the server before they are stored."
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