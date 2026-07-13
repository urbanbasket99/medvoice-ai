import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

import ConfirmDialog from "./ConfirmDialog";
import { renderWithProviders, screen } from "../../test/test-utils";

describe("ConfirmDialog", () => {
  it("renders title and message when open", () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Deactivate Patient?"
        message="This action cannot be undone."
        confirmLabel="Deactivate"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Deactivate Patient?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    renderWithProviders(
      <ConfirmDialog
        open
        title="Confirm"
        message="Proceed?"
        confirmLabel="Yes"
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Yes" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("disables actions while pending", () => {
    renderWithProviders(
      <ConfirmDialog
        open
        title="Confirm"
        message="Proceed?"
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        isPending
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  });
});

describe("EmptyState", () => {
  it("renders title and optional action", async () => {
    const { default: EmptyState } = await import("./EmptyState");

    renderWithProviders(
      <EmptyState
        icon={InboxRoundedIcon}
        title="No records found"
        description="Try adjusting your filters."
        action={<button type="button">Clear filters</button>}
      />,
    );

    expect(screen.getByText("No records found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your filters.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders title, subtitle, and actions", async () => {
    const { default: PageHeader } = await import("./PageHeader");

    renderWithProviders(
      <PageHeader
        title="Patients"
        subtitle="Manage patient records"
        actions={<button type="button">Add Patient</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Patients" })).toBeInTheDocument();
    expect(screen.getByText("Manage patient records")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Patient" })).toBeInTheDocument();
  });
});
