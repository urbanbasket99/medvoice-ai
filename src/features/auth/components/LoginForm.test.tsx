import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "./LoginForm";
import { renderWithProviders } from "../../../test/test-utils";

const loginMock = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    isLoggingIn: false,
    user: null,
    isAuthenticated: false,
    isInitializing: false,
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    loginMock.mockResolvedValue(undefined);
  });

  it("renders email and password fields", () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Sign In" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("submits credentials via auth login", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText("Email"), "admin@medvoice.com");
    await user.type(screen.getByLabelText("Password"), "Admin@123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "admin@medvoice.com",
        password: "Admin@123",
      });
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("opens forgot password dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    expect(screen.getByRole("dialog", { name: "Reset your password" })).toBeInTheDocument();
  });
});
