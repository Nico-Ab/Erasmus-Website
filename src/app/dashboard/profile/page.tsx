import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireApprovedAuth } from "@/lib/auth/guards";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { getEditableProfileData } from "@/lib/profile/service";

export default async function ProfilePage() {
  const session = await requireApprovedAuth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const data = await getEditableProfileData(session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: messages.common.dashboard, href: "/dashboard" },
          { label: messages.navigation.dashboard.profile.title }
        ]}
        description={messages.profile.pageDescription}
        eyebrow={messages.profile.eyebrow}
        title={messages.profile.pageTitle}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title={messages.profile.statusTitle} value={messages.profile.statusValue} description={messages.profile.statusDescription} />
        <OverviewMetric title={messages.profile.facultyTitle} value={data.user.faculty?.name ?? messages.common.notAssigned} description={messages.profile.facultyDescription} />
        <OverviewMetric title={messages.profile.departmentTitle} value={data.user.department?.name ?? messages.common.notSet} description={messages.profile.departmentDescription} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title={messages.profile.guidanceTitle}
          description={messages.profile.guidanceDescription}
          points={messages.profile.guidancePoints}
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
          legacySelection={data.legacySelection}
          role={session.user.role}
        />
      </section>
    </div>
  );
}
