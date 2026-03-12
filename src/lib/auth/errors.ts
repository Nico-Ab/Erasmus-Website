import { CredentialsSignin } from "next-auth";
import { authErrorCodes } from "@/lib/auth/error-codes";

export class InvalidCredentialsError extends CredentialsSignin {
  code = authErrorCodes.invalidCredentials;
}

export class PendingApprovalError extends CredentialsSignin {
  code = authErrorCodes.pendingApproval;
}

export class AccountRejectedError extends CredentialsSignin {
  code = authErrorCodes.accountRejected;
}

export class AccountDeactivatedError extends CredentialsSignin {
  code = authErrorCodes.accountDeactivated;
}