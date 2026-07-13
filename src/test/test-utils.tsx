import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

import theme from "../theme";
import { AuthProvider } from "../features/auth";

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  routerProps?: MemoryRouterProps;
  queryClient?: QueryClient;
  withAuth?: boolean;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (
  ui: ReactElement,
  {
    route = "/",
    routerProps,
    queryClient = createTestQueryClient(),
    withAuth = false,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]} {...routerProps}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    );

    if (withAuth) {
      return <AuthProvider>{content}</AuthProvider>;
    }

    return content;
  };

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
