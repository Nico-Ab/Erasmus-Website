export function buildPendingApprovalPath(params: {
  email?: string | null;
  registered?: boolean;
} = {}) {
  const searchParams = new URLSearchParams();

  if (params.email) {
    searchParams.set("email", params.email);
  }

  if (params.registered) {
    searchParams.set("registered", "1");
  }

  const query = searchParams.toString();

  return query ? `/pending-approval?${query}` : "/pending-approval";
}

export function buildLoginStatePath(state?: "rejected" | "deactivated") {
  if (!state) {
    return "/login";
  }

  const searchParams = new URLSearchParams({ state });

  return `/login?${searchParams.toString()}`;
}