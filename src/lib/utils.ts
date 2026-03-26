import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  formatRoleLabel as formatRoleLabelByLocale,
  formatStatusLabel as formatStatusLabelByLocale
} from "@/lib/i18n/format";
import type { AppLocale } from "@/lib/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRoleLabel(role: string, locale: AppLocale = "en") {
  return formatRoleLabelByLocale(role, locale);
}

export function formatStatusLabel(value: string, locale: AppLocale = "en") {
  return formatStatusLabelByLocale(value, locale);
}
