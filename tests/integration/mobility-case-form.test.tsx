import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobilityCaseForm } from "@/components/cases/mobility-case-form";
import {
  createMobilityCaseFormValues,
  createMobilityCaseReferenceData
} from "../factories/mobility-case";
import { renderWithUser } from "../helpers/render";

const router = {
  push: vi.fn(),
  refresh: vi.fn()
};

const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

describe("MobilityCaseForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    router.push.mockReset();
    router.refresh.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows submit-only validation feedback for required fields", async () => {
    const referenceData = createMobilityCaseReferenceData();
    const { user } = renderWithUser(
      <MobilityCaseForm
        academicYears={referenceData.academicYears}
        initialValues={createMobilityCaseFormValues({
          academicYearId: "",
          mobilityTypeOptionId: "",
          hostInstitution: "",
          hostCountry: "",
          hostCity: "",
          startDate: "",
          endDate: ""
        })}
        mobilityTypes={referenceData.mobilityTypes}
      />
    );

    await user.click(screen.getByRole("button", { name: /submit case/i }));

    expect(await screen.findByText("Academic year is required")).toBeInTheDocument();
    expect(screen.getByText("Host institution is required")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits draft values to the create endpoint", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          redirectTo: "/dashboard/staff/cases/case_1?saved=draft"
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );
    const referenceData = createMobilityCaseReferenceData();
    const { user } = renderWithUser(
      <MobilityCaseForm
        academicYears={referenceData.academicYears}
        initialValues={createMobilityCaseFormValues()}
        mobilityTypes={referenceData.mobilityTypes}
      />
    );

    await user.click(screen.getByRole("button", { name: /^save draft$/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/staff/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...createMobilityCaseFormValues(),
          intent: "saveDraft"
        })
      });
    });
    expect(router.push).toHaveBeenCalledWith("/dashboard/staff/cases/case_1?saved=draft");
    expect(router.refresh).toHaveBeenCalled();
  });

  it("sends edited draft values to the update endpoint", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          redirectTo: "/dashboard/staff/cases/case_2?saved=draft&savedAt=123"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    );
    const referenceData = createMobilityCaseReferenceData();
    const { user } = renderWithUser(
      <MobilityCaseForm
        academicYears={referenceData.academicYears}
        caseId="case_2"
        currentStatus={{ key: "draft", label: "Draft" }}
        initialValues={createMobilityCaseFormValues()}
        mobilityTypes={referenceData.mobilityTypes}
      />
    );

    await user.clear(screen.getByLabelText(/host institution/i));
    await user.type(screen.getByLabelText(/host institution/i), "Updated Host Institution");
    await user.clear(screen.getByLabelText(/notes/i));
    await user.type(screen.getByLabelText(/notes/i), "Updated draft notes.");
    await user.click(screen.getByRole("button", { name: /save draft changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/staff/cases/case_2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...createMobilityCaseFormValues(),
          hostInstitution: "Updated Host Institution",
          notes: "Updated draft notes.",
          intent: "saveDraft"
        })
      });
    });
  });
});