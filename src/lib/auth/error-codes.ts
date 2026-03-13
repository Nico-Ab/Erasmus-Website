export const authErrorCodes = {
  invalidCredentials: "invalid_credentials",
  pendingApproval: "pending_approval",
  accountRejected: "account_rejected",
  accountDeactivated: "account_deactivated"
} as const;

export function getLoginErrorMessage(code?: string) {
  switch (code) {
    case authErrorCodes.pendingApproval:
      return "Your account is waiting for admin approval.";
    case authErrorCodes.accountRejected:
      return "Your registration was rejected. Please contact the Erasmus office.";
    case authErrorCodes.accountDeactivated:
      return "Your account is deactivated. Please contact an administrator.";
    case authErrorCodes.invalidCredentials:
      return "Sign in could not be completed. Check your email, password, and account approval status.";
    default:
      return "Sign in could not be completed right now. Please try again.";
  }
}