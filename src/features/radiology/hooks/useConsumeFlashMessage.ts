import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface FlashLocationState {
  flashMessage?: string;
}

export const useConsumeFlashMessage = (showSuccess: (message: string) => void) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as FlashLocationState | null;
    if (state?.flashMessage) {
      showSuccess(state.flashMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, showSuccess]);
};
