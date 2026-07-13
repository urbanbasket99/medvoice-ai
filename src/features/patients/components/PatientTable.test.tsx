import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import PatientTable from "./PatientTable";
import { renderWithProviders } from "../../../test/test-utils";
import type { Patient } from "../types/patient.types";

const samplePatient: Patient = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  mrn: "MRN-000001",
  uhid: "MVH-000001",
  firstName: "Jane",
  middleName: null,
  lastName: "Doe",
  fullName: "Jane Doe",
  dateOfBirth: "1990-05-10",
  age: 35,
  gender: "female",
  bloodGroup: "O+",
  maritalStatus: "single",
  occupation: null,
  mobile: "9876543210",
  alternateMobile: null,
  email: "jane@example.com",
  addressLine1: null,
  addressLine2: null,
  city: "Hyderabad",
  state: null,
  country: null,
  postalCode: null,
  emergencyName: null,
  emergencyRelation: null,
  emergencyMobile: null,
  insuranceProvider: null,
  insuranceNumber: null,
  allergies: null,
  chronicConditions: null,
  notes: null,
  status: "active",
  registrationDate: "2024-01-01",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("PatientTable", () => {
  it("renders patient rows in the data grid", () => {
    renderWithProviders(
      <div style={{ width: 960, height: 480 }}>
        <PatientTable
          rows={[samplePatient]}
          rowCount={1}
          loading={false}
          paginationModel={{ page: 0, pageSize: 10 }}
          onPaginationModelChange={vi.fn()}
          sortModel={[]}
          onSortModelChange={vi.fn()}
          onView={vi.fn()}
          onEdit={vi.fn()}
          onDeactivate={vi.fn()}
          canUpdate
          canDelete
        />
      </div>,
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("MVH-000001")).toBeInTheDocument();
  });

  it("shows empty overlay when there are no rows", () => {
    renderWithProviders(
      <div style={{ width: 960, height: 480 }}>
        <PatientTable
          rows={[]}
          rowCount={0}
          loading={false}
          paginationModel={{ page: 0, pageSize: 10 }}
          onPaginationModelChange={vi.fn()}
          sortModel={[]}
          onSortModelChange={vi.fn()}
          onView={vi.fn()}
          onEdit={vi.fn()}
          onDeactivate={vi.fn()}
          canUpdate={false}
          canDelete={false}
        />
      </div>,
    );

    expect(screen.getByText("No records found")).toBeInTheDocument();
  });
});
