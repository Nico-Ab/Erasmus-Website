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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm" aria-label="User management table">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-3 py-3 font-medium">User</th>
            <th className="px-3 py-3 font-medium">Role</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Registered</th>
            <th className="px-3 py-3 font-medium">Reviewed</th>
            <th className="px-3 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
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
                className="border-b border-slate-100 align-top text-slate-700 last:border-b-0"
                data-testid={`admin-user-row-${user.id}`}
              >
                <td className="px-3 py-4">
                  <div className="font-semibold text-slate-900">{formatUserName(user)}</div>
                  <div className="mt-1 text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-3 py-4">
                  <Badge variant="muted">{formatRoleLabel(user.role)}</Badge>
                </td>
                <td className="px-3 py-4">
                  <Badge variant={getStatusVariant(user.status)}>{formatStatusLabel(user.status)}</Badge>
                </td>
                <td className="px-3 py-4 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                <td className="px-3 py-4 text-xs text-slate-500">
                  <div>{formatDate(user.reviewedAt)}</div>
                  {reviewedByLabel ? <div className="mt-1">Reviewed by {reviewedByLabel}</div> : null}
                </td>
                <td className="px-3 py-4">
                  <div className="space-y-3">
                    {user.role === UserRole.STAFF && user.status !== UserApprovalStatus.APPROVED ? (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-wrap gap-2">
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
                      <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`role-${user.id}`}>Role assignment</Label>
                          <Select defaultValue={user.role} disabled={!canChangeRole || isBusy("changeRole")} id={`role-${user.id}`} name="role">
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
                      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <div className="space-y-2">
                          <Label htmlFor={`deactivate-confirm-${user.id}`}>Type {user.email} to deactivate access</Label>
                          <Input disabled={!canDeactivate} id={`deactivate-confirm-${user.id}`} name="confirmationText" />
                        </div>
                        <Button disabled={!canDeactivate || isBusy("deactivate")} size="sm" type="submit" variant="outline">
                          {isBusy("deactivate") ? "Saving..." : "Deactivate user"}
                        </Button>
                      </div>
                      {!canDeactivate ? (
                        <p className="mt-2 text-xs text-slate-500">
                          This account is already deactivated.
                        </p>
                      ) : null}
                    </form>

                    {noticeByUserId[user.id] ? (
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
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
  );
}