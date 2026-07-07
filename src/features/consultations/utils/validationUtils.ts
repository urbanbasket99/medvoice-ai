import type { FieldErrors } from "react-hook-form";

import type { ConsultationFormValues } from "../schemas/consultationSchema";

const flattenErrors = (errors: FieldErrors<ConsultationFormValues>, prefix = ""): string[] => {
  const messages: string[] = [];

  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const label = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && "message" in value && typeof value.message === "string") {
      messages.push(`${label}: ${value.message}`);
      continue;
    }

    if (typeof value === "object") {
      messages.push(...flattenErrors(value as FieldErrors<ConsultationFormValues>, label));
    }
  }

  return messages;
};

export const getFirstValidationMessage = (errors: FieldErrors<ConsultationFormValues>): string => {
  const messages = flattenErrors(errors);
  return messages[0] ?? "Please fix the highlighted fields before saving.";
};
