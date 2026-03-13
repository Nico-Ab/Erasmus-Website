import { DocumentReviewState } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  changeReviewCaseStatus,
  createReviewCaseComment,
  markMissingDocumentForReview,
  reviewDocumentVersion
} from "@/lib/review-workflow/service";

const { prismaMock } = vi.hoisted(() => {
  const transactionMock = {
    mobilityCase: {
      update: vi.fn()
    },
    mobilityCaseStatusHistory: {
      create: vi.fn()
    }
  };

  return {
    prismaMock: {
      caseStatusDefinition: {
        findFirst: vi.fn(),
        findMany: vi.fn()
      },
      mobilityCase: {
        findMany: vi.fn(),
        findUnique: vi.fn()
      },
      mobilityCaseComment: {
        create: vi.fn()
      },
      mobilityCaseDocument: {
        findMany: vi.fn()
      },
      mobilityCaseDocumentVersion: {
        findFirst: vi.fn(),
        update: vi.fn()
      },
      academicYear: {
        findMany: vi.fn()
      },
      faculty: {
        findMany: vi.fn()
      },
      department: {
        findMany: vi.fn()
      },
      selectOption: {
        findMany: vi.fn()
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

describe("review workflow service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records explicit history when an officer changes case status", async () => {
    prismaMock.mobilityCase.findUnique.mockResolvedValue({
      id: "case_1",
      statusDefinitionId: "status_submitted",
      statusDefinition: {
        key: "submitted",
        label: "Submitted"
      }
    });
    prismaMock.caseStatusDefinition.findFirst.mockResolvedValue({
      id: "status_under_review",
      key: "under_review",
      label: "Under Review"
    });

    const result = await changeReviewCaseStatus(
      "officer_user",
      "case_1",
      "under_review",
      "Initial officer screening started."
    );

    expect(prismaMock.__transaction.mobilityCase.update).toHaveBeenCalledWith({
      where: { id: "case_1" },
      data: {
        statusDefinitionId: "status_under_review"
      }
    });
    expect(prismaMock.__transaction.mobilityCaseStatusHistory.create).toHaveBeenCalledWith({
      data: {
        mobilityCaseId: "case_1",
        fromStatusDefinitionId: "status_submitted",
        toStatusDefinitionId: "status_under_review",
        changedByUserId: "officer_user",
        note: "Initial officer screening started."
      }
    });
    expect(result).toEqual({
      status: "updated",
      currentStatusKey: "under_review"
    });
  });

  it("blocks archive transitions until a case is completed", async () => {
    prismaMock.mobilityCase.findUnique.mockResolvedValue({
      id: "case_2",
      statusDefinitionId: "status_submitted",
      statusDefinition: {
        key: "submitted",
        label: "Submitted"
      }
    });
    prismaMock.caseStatusDefinition.findFirst.mockResolvedValue({
      id: "status_archived",
      key: "archived",
      label: "Archived"
    });

    const result = await changeReviewCaseStatus("officer_user", "case_2", "archived", "");

    expect(prismaMock.__transaction.mobilityCase.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "invalid_transition",
      message: "Only completed cases can be archived."
    });
  });

  it("creates timestamped case comments with the reviewing author", async () => {
    prismaMock.mobilityCase.findUnique.mockResolvedValue({ id: "case_3" });
    prismaMock.mobilityCaseComment.create.mockResolvedValue({ id: "comment_1" });

    const result = await createReviewCaseComment(
      "officer_user",
      "case_3",
      "  Please upload the signed version with the official stamp.  "
    );

    expect(prismaMock.mobilityCaseComment.create).toHaveBeenCalledWith({
      data: {
        mobilityCaseId: "case_3",
        authorUserId: "officer_user",
        body: "Please upload the signed version with the official stamp."
      },
      select: {
        id: true
      }
    });
    expect(result).toEqual({
      status: "created",
      commentId: "comment_1"
    });
  });

  it("rejects the current document version and stores review metadata separately from case state", async () => {
    prismaMock.mobilityCaseDocumentVersion.findFirst.mockResolvedValue({
      id: "version_1",
      document: {
        currentVersionId: "version_1"
      }
    });

    const result = await reviewDocumentVersion(
      "officer_user",
      "case_4",
      "version_1",
      "reject",
      "Missing signature on the uploaded agreement."
    );

    expect(prismaMock.mobilityCaseDocumentVersion.update).toHaveBeenCalledWith({
      where: { id: "version_1" },
      data: expect.objectContaining({
        reviewState: DocumentReviewState.REJECTED,
        reviewComment: "Missing signature on the uploaded agreement.",
        reviewedByUserId: "officer_user"
      })
    });
    expect(result).toEqual({
      status: "reviewed",
      reviewState: DocumentReviewState.REJECTED
    });
  });

  it("records a missing-document note when no current version exists", async () => {
    prismaMock.mobilityCase.findUnique.mockResolvedValue({
      id: "case_5",
      documents: []
    });
    prismaMock.mobilityCaseComment.create.mockResolvedValue({ id: "comment_2" });

    const result = await markMissingDocumentForReview(
      "officer_user",
      "case_5",
      "mobility_agreement",
      "Staff should upload the signed agreement before review continues."
    );

    expect(prismaMock.mobilityCaseComment.create).toHaveBeenCalledWith({
      data: {
        mobilityCaseId: "case_5",
        authorUserId: "officer_user",
        body:
          "Mobility Agreement is missing from the case record. Staff should upload the signed agreement before review continues."
      },
      select: {
        id: true
      }
    });
    expect(result).toEqual({
      status: "created",
      commentId: "comment_2"
    });
  });
});