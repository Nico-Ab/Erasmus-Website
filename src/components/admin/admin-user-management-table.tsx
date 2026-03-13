"use client";

import { UserApprovalStatus, UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatRoleLabel, formatStatusLabel } from "@/lib/utils";

type AdminUserRow = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  status: UserApprovalStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: {
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};

type AdminUserManagementTableProps = {
  users: AdminUserRow[];
};

function getStatusVariant(status: UserApprovalStatus) {
  if (status === UserApprovalStatus.APPROVED) {
    return "success" as const;
  }

  if (status === UserApprovalStatus.PENDING) {
    return "warning" as const;
  }

  return "muted" as const;
}

function getRoleVariant(role: UserRole) {
  if (role === UserRole.ADMIN) {
    return "default" as const;
  }

  if (role === UserRole.OFFICER) {
    return "info" as const;
  }

  return "muted" as const;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not reviewed";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatUserName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email?: string;
}) {
  const trimmedName = user.name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const fallbackName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return fallbackName || user.email || "Unnamed user";
}

export function AdminUserManagementTable({ users }: AdminUserManagementTableProps) {
  const router = useRouter();
  const [noticeByUserId, setNoticeByUserId] = useState<Record<string, string | null>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);

  async function submitAction(
    userId: string,
    actionKey: string,
    payload: Record<string, unknown>,
    onSuccess?: () => void
  ) {
    setActiveKey(`${userId}:${actionKey}`);
    setNoticeByUserId((current) => ({ ...current, [userId]: null }));

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    const message = body?.message ?? "The user action could not be completed.";

    setNoticeByUserId((current) => ({ ...current, [userId]: message }));
    setActiveKey(null);

    if (response.ok) {
      onSuccess?.();
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {users.length} user{users.length === 1 ? "" : "s"} in the administration register
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Review registrations, assign roles deliberately, and confirm access changes before they take effect.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm" aria-label="User management table">
          <caption className="sr-only">
            User administration table with registration review, role assignment, and deactivation actions.
          </caption>
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">User</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Role</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Status</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Registered</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Reviewed</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-sm text-slate-600" colSpan={6}>
                  No users are currently available in the administration register.
                </td>
              </tr>
            ) : null}

            {users.map((user) => {
              const isBusy = (actionKey: string) => activeKey === `${user.id}:${actionKey}`;
              const reviewedByLabel = user.reviewedBy
                ? `${formatUserName(user.reviewedBy)} (${user.reviewedBy.email})`
                : null;
              const canChangeRole = user.status === UserApprovalStatus.APPROVED;
              const canDeactivate = user.status !== UserApprovalStatus.DEACTIVATED;

              return (
                <tr
                  key={user.id}
                  className="align-top text-slate-700 transition-colors hover:bg-slate-50/60"
                  data-testid={`admin-user-row-${user.id}`}
                >
                  <td className="border-b border-slate-100 px-4 py-4">
                    <div className="font-semibold text-slate-950">{formatUserName(user)}</div>
                    <div className="mt-1 text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <Badge variant={getRoleVariant(user.role)}>{formatRoleLabel(user.role)}</Badge>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <Badge variant={getStatusVariant(user.status)}>{formatStatusLabel(user.status)}</Badge>
                  </td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4 text-xs text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4 text-xs text-slate-500">
                    <div>{formatDate(user.reviewedAt)}</div>
                    {reviewedByLabel ? <div className="mt-1">Reviewed by {reviewedByLabel}</div> : null}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-4">
                    <div className="space-y-3 min-w-[26rem]">
                      {user.role === UserRole.STAFF && user.status !== UserApprovalStatus.APPROVED ? (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registration review</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              disabled={isBusy("approve")}
                              onClick={() => {
                                void submitAction(user.id, "approve", { action: "approve" });
                              }}
                              size="sm"
                              type="button"
                            >
                              {isBusy("approve") ? "Approving..." : "Approve"}
                            </Button>
                          </div>
                          <form
                            className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
                            onSubmit={async (event) => {
                              event.preventDefault();
                              const formData = new FormData(event.currentTarget);
                              await submitAction(
                                user.id,
                                "reject",
                                {
                                  action: "reject",
                                  confirmationText: String(formData.get("confirmationText") ?? "")
                                },
                                () => event.currentTarget.reset()
                              );
                            }}
                          >
                            <div className="space-y-2">
                              <Label htmlFor={`reject-confirm-${user.id}`}>Type {user.email} to reject</Label>
                              <Input id={`reject-confirm-${user.id}`} name="confirmationText" />
                            </div>
                            <Button disabled={isBusy("reject")} size="sm" type="submit" variant="outline">
                              {isBusy("reject") ? "Saving..." : "Reject registration"}
                            </Button>
                          </form>
                        </div>
                      ) : null}

                      <form
                        className="rounded-lg border border-slate-200 bg-white p-3"
                        onSubmit={async (event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          await submitAction(
                            user.id,
                            "changeRole",
                            {
                              action: "changeRole",
                              role: String(formData.get("role") ?? user.role),
                              confirmationText: String(formData.get("confirmationText") ?? "")
                            },
                            () => event.currentTarget.reset()
                          );
                        }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role assignment</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
                          <div className="space-y-2">
                            <Label htmlFor={`role-${user.id}`}>Role assignment</Label>
                            <Select
                              defaultValue={user.role}
                              disabled={!canChangeRole || isBusy("changeRole")}
                              id={`role-${user.id}`}
                              name="role"
                            >
                              <option value={UserRole.STAFF}>Staff</option>
                              <option value={UserRole.OFFICER}>Officer</option>
                              <option value={UserRole.ADMIN}>Admin</option>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`change-role-confirm-${user.id}`}>Type {user.email} to confirm</Label>
                            <Input disabled={!canChangeRole} id={`change-role-confirm-${user.id}`} name="confirmationText" />
                          </div>
                          <Button disabled={!canChangeRole || isBusy("changeRole")} size="sm" type="submit" variant="outline">
                            {isBusy("changeRole") ? "Saving..." : "Change role"}
                          </Button>
                        </div>
                        {!canChangeRole ? (
                          <p className="mt-2 text-xs text-slate-500">
                            Only approved active users can change roles from this page.
                          </p>
                        ) : null}
                      </form>

                      <form
                        className="rounded-lg border border-slate-200 bg-white p-3"
                        onSubmit={async (event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          await submitAction(
                            user.id,
                            "deactivate",
                            {
                              action: "deactivate",
                              confirmationText: String(formData.get("confirmationText") ?? "")
                            },
                            () => event.currentTarget.reset()
                          );
                        }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Access control</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                          <div className="space-y-2">
                            <Label htmlFor={`deactivate-confirm-${user.id}`}>Type {user.email} to deactivate access</Label>
                            <Input disabled={!canDeactivate} id={`deactivate-confirm-${user.id}`} name="confirmationText" />
                          </div>
                          <Button disabled={!canDeactivate || isBusy("deactivate")} size="sm" type="submit" variant="outline">
                            {isBusy("deactivate") ? "Saving..." : "Deactivate user"}
                          </Button>
                        </div>
                        {!canDeactivate ? (
                          <p className="mt-2 text-xs text-slate-500">This account is already deactivated.</p>
                        ) : null}
                      </form>

                      {noticeByUserId[user.id] ? (
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700" role="status">
                          {noticeByUserId[user.id]}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
