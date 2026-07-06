import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface FlashMessageState {
  flashMessage?: string;
}

/**
 * Reads a one-shot `flashMessage` passed via `navigate(path, { state })` —
 * used so a success toast (e.g. "Patient registered") survives the
 * redirect from the registration/edit form to the details page instead of
 * being unmounted along with the page that triggered it. The message is
 * cleared from history state immediately after firing so it never
 * reappears on refresh or browser back/forward.
 */
export const useConsumeFlashMessage = (onMessage: (message: string) => void) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as FlashMessageState | null;
    if (state?.flashMessage) {
      onMessage(state.flashMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Only re-run when the location's state identity changes; `onMessage`/
    // `navigate` are read at fire time via the closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.pathname]);
};
