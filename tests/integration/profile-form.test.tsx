import { UserRole } from "@prisma/client";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/components/profile/profile-form";
import { createProfileInput, createProfileReferenceData } from "../factories/profile";
import { renderWithUser } from "../helpers/render";

const router = {
  refresh: vi.fn()
};

const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

describe("ProfileForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    router.refresh.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  async function waitForProfileFormReady() {
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toBeEnabled();
    });
  }

  it("shows validation feedback before submit", async () => {
    const referenceData = createProfileReferenceData();
    const { user } = renderWithUser(
      <ProfileForm
        academicTitleOptions={referenceData.academicTitleOptions}
        faculties={referenceData.faculties}
        initialValues={createProfileInput()}
        legacySelection={referenceData.legacySelection}
        role={UserRole.STAFF}
      />
    );

    await waitForProfileFormReady();
    await user.clear(screen.getByLabelText(/first name/i));
    await user.click(await screen.findByRole("button", { name: /save profile/i }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resets the department when the faculty changes", async () => {
    const referenceData = createProfileReferenceData();
    const { user } = renderWithUser(
      <ProfileForm
        academicTitleOptions={referenceData.academicTitleOptions}
        faculties={referenceData.faculties}
        initialValues={createProfileInput()}
        legacySelection={referenceData.legacySelection}
        role={UserRole.STAFF}
      />
    );

    await waitForProfileFormReady();
    await user.selectOptions(screen.getByLabelText(/faculty/i), "faculty_law_history");

    expect(screen.getByLabelText(/department/i)).toHaveValue("");
  });

  it("submits valid profile details and refreshes the page", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Profile updated successfully." }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const referenceData = createProfileReferenceData();
    const { user } = renderWithUser(
      <ProfileForm
        academicTitleOptions={referenceData.academicTitleOptions}
        faculties={referenceData.faculties}
        initialValues={createProfileInput()}
        legacySelection={referenceData.legacySelection}
        role={UserRole.STAFF}
      />
    );

    await waitForProfileFormReady();
    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Elena Updated");
    await user.selectOptions(screen.getByLabelText(/faculty/i), "faculty_law_history");
    await user.selectOptions(screen.getByLabelText(/department/i), "department_public");
    await user.click(await screen.findByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...createProfileInput(),
          firstName: "Elena Updated",
          facultyId: "faculty_law_history",
          departmentId: "department_public"
        })
      });
    });
    expect(await screen.findByText(/profile updated successfully\./i)).toBeInTheDocument();
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows a server-side email conflict message", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Another account already uses this email address.",
          fieldErrors: {
            email: ["Another account already uses this email address."]
          }
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );
    const referenceData = createProfileReferenceData();
    const { user } = renderWithUser(
      <ProfileForm
        academicTitleOptions={referenceData.academicTitleOptions}
        faculties={referenceData.faculties}
        initialValues={createProfileInput()}
        legacySelection={referenceData.legacySelection}
        role={UserRole.STAFF}
      />
    );

    await waitForProfileFormReady();
    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), "duplicate@swu.local");
    await user.click(await screen.findByRole("button", { name: /save profile/i }));

    const duplicateMessages = await screen.findAllByText(
      /another account already uses this email address\./i
    );

    expect(duplicateMessages).toHaveLength(2);
  });

  it("allows central admin and officer profiles to save without faculty or department", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Profile updated successfully." }), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const referenceData = createProfileReferenceData();
    const { user } = renderWithUser(
      <ProfileForm
        academicTitleOptions={referenceData.academicTitleOptions}
        faculties={referenceData.faculties}
        initialValues={createProfileInput({ facultyId: "", departmentId: "" })}
        legacySelection={referenceData.legacySelection}
        role={UserRole.ADMIN}
      />
    );

    await waitForProfileFormReady();
    await user.selectOptions(screen.getByLabelText(/faculty/i), "");
    await user.click(await screen.findByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(createProfileInput({ facultyId: "", departmentId: "" }))
      });
    });
  });

  it("renders Bulgarian profile labels when the locale is switched", async () => {
    const referenceData = createProfileReferenceData();
    renderWithUser(
      <ProfileForm
        academicTitleOptions={referenceData.academicTitleOptions}
        faculties={referenceData.faculties}
        initialValues={createProfileInput()}
        legacySelection={referenceData.legacySelection}
        role={UserRole.STAFF}
      />,
      { locale: "bg" }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^име$/i)).toBeEnabled();
    });
    expect(screen.getByLabelText(/академична титла/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /запази профила/i })).toBeInTheDocument();
  });
});
