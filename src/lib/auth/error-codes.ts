export const authErrorCodes = {
  invalidCredentials: "invalid_credentials",
  pendingApproval: "pending_approval",
  accountRejected: "account_rejected",
  accountDeactivated: "account_deactivated"
} as const;

export function getLoginErrorMessage(code?: string) {
  switch (code) {
    case authErrorCodes.pendingApproval:
      return "Your account is waiting for admin approval."
    case authErrorCodes.accountRejected:
      return "Your registration was rejected. Please contact the Erasmus office."
    case authErrorCodes.accountDeactivated:
      return "Your account is deactivated. Please contact an administrator."
    default:
      return "Sign-in failed. Check your credentials or account approval status."
  }
}