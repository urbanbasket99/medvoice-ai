import type { ReactNode } from "react";
import { Box } from "@mui/material";

export interface PageContentProps {
  children: ReactNode;
}

const PageContent = ({ children }: PageContentProps) => (
  <Box
    sx={{
      "@keyframes pageFadeIn": {
        from: { opacity: 0, transform: "translateY(6px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      animation: "pageFadeIn 0.28s ease-out",
      "@media (prefers-reduced-motion: reduce)": {
        animation: "none",
      },
    }}
  >
    {children}
  </Box>
);

export default PageContent;
