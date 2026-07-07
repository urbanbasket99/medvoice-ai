import { z } from "zod";

export const GENDER_OPTIONS = ["male", "female", "other"] as const;

export const DEPARTMENT_OPTIONS = [
  "cardiology",
  "neurology",
  "orthopedics",
  "pediatrics",
  "general_medicine",
  "dermatology",
  "ent",
  "gynecology",
  "psychiatry",
  "radiology",
  "anesthesiology",
  "surgery",
  "ophthalmology",
  "urology",
  "oncology",
  "dentistry",
  "emergency_medicine",
  "other",
] as const;

export const DOCTOR_STATUS_OPTIONS = ["active", "inactive", "on_leave"] as const;

const MOBILE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .optional()
    .or(z.literal(""));

export const doctorFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200, "Too long"),
  gender: z.enum(GENDER_OPTIONS, {
    required_error: "Select a gender",
    invalid_type_error: "Select a gender",
  }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  department: z.enum(DEPARTMENT_OPTIONS, {
    required_error: "Select a department",
    invalid_type_error: "Select a department",
  }),
  specialization: z.string().trim().min(1, "Specialization is required").max(150, "Too long"),
  qualification: z.string().trim().min(1, "Qualification is required").max(255, "Too long"),
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required")
    .max(100, "Too long"),
  experienceYears: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(80, "Must be 80 years or fewer"),
  mobile: z.string().trim().regex(MOBILE_PATTERN, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  address: optionalText(500),
  languagesSpoken: optionalText(500),
  consultationFee: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(Number(value)), "Enter a valid fee")
    .refine((value) => !value || Number(value) >= 0, "Fee cannot be negative"),
  workingHours: optionalText(255),
  photoUrl: optionalText(500),
  joiningDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Enter a valid joining date")
    .refine(
      (value) => !value || new Date(value) <= new Date(),
      "Joining date cannot be in the future"
    ),
  status: z.enum(DOCTOR_STATUS_OPTIONS).optional(),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export const doctorFormDefaultValues: DoctorFormValues = {
  fullName: "",
  gender: "male",
  dateOfBirth: "",
  department: "general_medicine",
  specialization: "",
  qualification: "",
  registrationNumber: "",
  experienceYears: 0,
  mobile: "",
  email: "",
  address: "",
  languagesSpoken: "",
  consultationFee: "",
  workingHours: "",
  photoUrl: "",
  joiningDate: "",
  status: "active",
};

export const DEPARTMENT_LABELS: Record<(typeof DEPARTMENT_OPTIONS)[number], string> = {
  cardiology: "Cardiology",
  neurology: "Neurology",
  orthopedics: "Orthopedics",
  pediatrics: "Pediatrics",
  general_medicine: "General Medicine",
  dermatology: "Dermatology",
  ent: "ENT",
  gynecology: "Gynecology",
  psychiatry: "Psychiatry",
  radiology: "Radiology",
  anesthesiology: "Anesthesiology",
  surgery: "Surgery",
  ophthalmology: "Ophthalmology",
  urology: "Urology",
  oncology: "Oncology",
  dentistry: "Dentistry",
  emergency_medicine: "Emergency Medicine",
  other: "Other",
};

export const DOCTOR_STATUS_LABELS: Record<(typeof DOCTOR_STATUS_OPTIONS)[number], string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
};
