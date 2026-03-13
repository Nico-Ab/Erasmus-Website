export const mobilityCaseStatusKeys = {
  draft: "draft",
  submitted: "submitted",
  changesRequired: "changes_required"
} as const;

export const editableMobilityCaseStatusKeys = new Set<string>([
  mobilityCaseStatusKeys.draft,
  mobilityCaseStatusKeys.changesRequired
]);