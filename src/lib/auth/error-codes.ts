import type { AppLocale } from "@/lib/i18n/config";

export const authErrorCodes = {
  invalidCredentials: "invalid_credentials",
  pendingApproval: "pending_approval",
  accountRejected: "account_rejected",
  accountDeactivated: "account_deactivated"
} as const;

export function getLoginErrorMessage(code?: string, locale: AppLocale = "en") {
  const messages =
    locale === "bg"
      ? {
          pendingApproval: "Вашият акаунт очаква административно одобрение.",
          accountRejected: "Вашата регистрация е отхвърлена. Свържете се с офиса по Еразъм.",
          accountDeactivated: "Вашият акаунт е деактивиран. Свържете се с администратор.",
          invalidCredentials:
            "Входът не може да бъде завършен. Проверете имейла, паролата и статуса на одобрение на акаунта.",
          fallback: "Входът не може да бъде завършен в момента. Опитайте отново."
        }
      : {
          pendingApproval: "Your account is waiting for admin approval.",
          accountRejected: "Your registration was rejected. Please contact the Erasmus office.",
          accountDeactivated: "Your account is deactivated. Please contact an administrator.",
          invalidCredentials:
            "Sign in could not be completed. Check your email, password, and account approval status.",
          fallback: "Sign in could not be completed right now. Please try again."
        };

  switch (code) {
    case authErrorCodes.pendingApproval:
      return messages.pendingApproval;
    case authErrorCodes.accountRejected:
      return messages.accountRejected;
    case authErrorCodes.accountDeactivated:
      return messages.accountDeactivated;
    case authErrorCodes.invalidCredentials:
      return messages.invalidCredentials;
    default:
      return messages.fallback;
  }
}
