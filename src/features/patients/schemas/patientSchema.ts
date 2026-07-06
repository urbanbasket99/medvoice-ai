import { z } from "zod";

export const GENDER_OPTIONS = ["male", "female", "other"] as const;
export const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "unknown",
] as const;
export const MARITAL_STATUS_OPTIONS = ["single", "married", "divorced", "widowed", "other"] as const;
export const PATIENT_STATUS_OPTIONS = ["active", "inactive", "deceased"] as const;

const MOBILE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .optional()
    .or(z.literal(""));

const optionalMobile = z
  .string()
  .trim()
  .regex(MOBILE_PATTERN, "Enter a valid mobile number")
  .optional()
  .or(z.literal(""));

/**
 * Single flattened schema backing `PatientForm`; the "Personal / Contact /
 * Address / Medical / Emergency Contact / Insurance / Administrative"
 * grouping is purely a UI concern (see `PatientForm`'s section layout) and
 * has no bearing on validation.
 */
export const patientFormSchema = z.object({
  // Personal Information
  firstName: z.string().trim().min(1, "First name is required").max(100, "Too long"),
  middleName: optionalText(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Too long"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  gender: z.enum(GENDER_OPTIONS, {
    required_error: "Select a gender",
    invalid_type_error: "Select a gender",
  }),
  bloodGroup: z.enum(BLOOD_GROUP_OPTIONS).optional().or(z.literal("")),
  maritalStatus: z.enum(MARITAL_STATUS_OPTIONS).optional().or(z.literal("")),
  occupation: optionalText(150),

  // Contact Information
  mobile: z.string().trim().regex(MOBILE_PATTERN, "Enter a valid mobile number"),
  alternateMobile: optionalMobile,
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),

  // Address
  addressLine1: optionalText(255),
  addressLine2: optionalText(255),
  city: optionalText(100),
  state: optionalText(100),
  country: optionalText(100),
  postalCode: optionalText(20),

  // Medical Information
  allergies: optionalText(2000),
  chronicConditions: optionalText(2000),
  notes: optionalText(2000),

  // Emergency Contact
  emergencyName: optionalText(150),
  emergencyRelation: optionalText(50),
  emergencyMobile: optionalMobile,

  // Insurance
  insuranceProvider: optionalText(150),
  insuranceNumber: optionalText(100),

  // Administrative
  registrationDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Enter a valid registration date"
    )
    .refine(
      (value) => !value || new Date(value) <= new Date(),
      "Registration date cannot be in the future"
    ),
  status: z.enum(PATIENT_STATUS_OPTIONS).optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const patientFormDefaultValues: PatientFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "male",
  bloodGroup: "",
  maritalStatus: "",
  occupation: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  allergies: "",
  chronicConditions: "",
  notes: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyMobile: "",
  insuranceProvider: "",
  insuranceNumber: "",
  registrationDate: "",
  status: "active",
};
