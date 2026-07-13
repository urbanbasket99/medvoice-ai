/**
 * Maps the current route to the leaf nav item id used for sidebar highlighting.
 */
export function resolveActiveNavId(pathname: string): string {
  if (pathname === "/") return "dashboard";

  if (pathname.startsWith("/patients")) return "patients";
  if (pathname.startsWith("/appointments")) return "appointments";
  if (pathname.startsWith("/consultations")) return "consultations";
  if (pathname.startsWith("/prescriptions")) return "prescriptions";
  if (pathname.startsWith("/certificates")) return "certificates";

  if (pathname.startsWith("/ipd/wards")) return "ipd-wards";
  if (pathname.startsWith("/ipd/beds")) return "ipd-beds";
  if (pathname.startsWith("/ipd/admissions")) return "ipd-admissions";

  if (pathname.startsWith("/laboratory/tests")) return "laboratory-tests";
  if (pathname.startsWith("/laboratory")) return "laboratory-orders";

  if (pathname.startsWith("/radiology/tests")) return "radiology-tests";
  if (pathname.startsWith("/radiology")) return "radiology-orders";

  if (pathname.startsWith("/pharmacy/dispense/retail")) return "pharmacy-retail";
  if (pathname.startsWith("/pharmacy/dispense")) return "pharmacy-dispense";
  if (pathname.startsWith("/pharmacy/medicines")) return "pharmacy-medicines";
  if (pathname.startsWith("/pharmacy/inventory")) return "pharmacy-inventory";
  if (pathname.startsWith("/pharmacy/suppliers")) return "pharmacy-suppliers";
  if (pathname.startsWith("/pharmacy/vendor-payments")) return "pharmacy-vendor-payments";
  if (pathname.startsWith("/pharmacy")) return "pharmacy-dispense";

  if (pathname.startsWith("/billing/outstanding")) return "billing-outstanding";
  if (pathname.startsWith("/billing/tpas")) return "billing-tpas";
  if (pathname.startsWith("/billing/reports")) return "billing-reports";
  if (pathname.startsWith("/billing")) return "billing-invoices";

  if (pathname.startsWith("/accounts/vouchers")) return "accounts-vouchers";
  if (pathname.startsWith("/accounts/cash-book")) return "accounts-cash-book";
  if (pathname.startsWith("/accounts/trial-balance")) return "accounts-trial-balance";
  if (pathname.startsWith("/accounts/ap")) return "accounts-ap";
  if (pathname.startsWith("/accounts")) return "accounts-chart";

  if (pathname.startsWith("/doctors")) return "doctors";

  if (pathname.startsWith("/voice/record")) return "voice-record";
  if (pathname.startsWith("/voice")) return "voice-history";
  if (pathname.startsWith("/transcriptions")) return "transcriptions";
  if (pathname.startsWith("/ai")) return "ai";

  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/audit")) return "audit-logs";

  return "dashboard";
}
