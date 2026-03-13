import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMobilityCaseForStaff,
  updateMobilityCaseForStaff
} from "@/lib/mobility-case/service";
import { createMobilityCaseFormValues } from "../factories/mobility-case";

const { prismaMock } = vi.hoisted(() => {
  const transactionMock = {
    mobilityCase: {
      create: vi.fn(),
      update: vi.fn()
    },
    mobilityCaseStatusHistory: {
      create: vi.fn()
    }
  };

  return {
    prismaMock: {
      academicYear: {
        findFirst: vi.fn()
      },
      caseStatusDefinition: {
        findMany: vi.fn()
      },
      mobilityCase: {
        findFirst: vi.fn()
      },
      mobilityCaseComment: {
        findMany: vi.fn()
      },
      selectOption: {
        findFirst: vi.fn()
      },
      user: {
        findUnique: vi.fn()
      },
      uploadSetting: {
        findUnique: vi.fn()
      },
      $transaction: vi.fn(async (callback: (client: typeof transactionMock) => unknown) =>
        callback(transactionMock)
      ),
      __transaction: transactionMock
    }
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

function mockWorkflowStatuses() {
  prismaMock.caseStatusDefinition.findMany.mockResolvedValue([
    { id: "status_draft", key: "draft", label: "Draft" },
    { id: "status_submitted", key: "submitted", label: "Submitted" },
    { id: "status_changes", key: "changes_required", label: "Changes Required" }
  ]);
}

describe("mobility case service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWorkflowStatuses();
    prismaMock.academicYear.findFirst.mockResolvedValue({ id: "academic_year_2025" });
    prismaMock.selectOption.findFirst.mockResolvedValue({ id: "mobility_type_teaching" });
  });

  it("creates draft cases with an initial status-history record", async () => {
    prismaMock.__transaction.mobilityCase.create.mockResolvedValue({
      id: "case_1",
      statusDefinition: {
        key: "draft"
      }
    });

    const result = await createMobilityCaseForStaff(
      "staff_user",
      createMobilityCaseFormValues(),
      "saveDraft"
    );

    expect(prismaMock.__transaction.mobilityCase.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          staffUserId: "staff_user",
          statusDefinitionId: "status_draft",
          submittedAt: null,
          hostInstitution: "University of Graz"
        })
      })
    );
    expect(prismaMock.__transaction.mobilityCaseStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        mobilityCaseId: "case_1",
        fromStatusDefinitionId: null,
        toStatusDefinitionId: "status_draft",
        changedByUserId: "staff_user"
      })
    });
    expect(result).toEqual({
      status: "created",
      caseId: "case_1",
      currentStatusKey: "draft"
    });
  });

  it("updates a draft and creates status history when submitted", async () => {
    prismaMock.mobilityCase.findFirst.mockResolvedValue({
      id: "case_2",
      statusDefinitionId: "status_draft",
      statusDefinition: {
        key: "draft"
      }
    });
    prismaMock.__transaction.mobilityCase.update.mockResolvedValue({
      id: "case_2",
      statusDefinition: {
        key: "submitted"
      }
    });

    const result = await updateMobilityCaseForStaff(
      "staff_user",
      "case_2",
      createMobilityCaseFormValues({ notes: "Submitted with final dates." }),
      "submit"
    );

    expect(prismaMock.__transaction.mobilityCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "case_2" },
        data: expect.objectContaining({
          statusDefinitionId: "status_submitted",
          hostInstitution: "University of Graz"
        })
      })
    );
    expect(prismaMock.__transaction.mobilityCaseStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        mobilityCaseId: "case_2",
        fromStatusDefinitionId: "status_draft",
        toStatusDefinitionId: "status_submitted",
        changedByUserId: "staff_user"
      })
    });
    expect(result).toEqual({
      status: "updated",
      caseId: "case_2",
      currentStatusKey: "submitted"
    });
  });

  it("blocks edits for cases that are already outside editable states", async () => {
    prismaMock.mobilityCase.findFirst.mockResolvedValue({
      id: "case_3",
      statusDefinitionId: "status_submitted",
      statusDefinition: {
        key: "submitted"
      }
    });

    const result = await updateMobilityCaseForStaff(
      "staff_user",
      "case_3",
      createMobilityCaseFormValues(),
      "saveDraft"
    );

    expect(prismaMock.__transaction.mobilityCase.update).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "not_editable" });
  });
});