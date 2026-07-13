const STORAGE_KEY = "medvoice_remember_email";
const REMEMBER_FLAG_KEY = "medvoice_remember_me";

export const loadRememberedEmail = (): { email: string; remember: boolean } => {
  try {
    const remember = localStorage.getItem(REMEMBER_FLAG_KEY) === "true";
    const email = localStorage.getItem(STORAGE_KEY) ?? "";
    return { email: remember ? email : "", remember };
  } catch {
    return { email: "", remember: false };
  }
};

export const saveRememberedEmail = (email: string, remember: boolean): void => {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_FLAG_KEY, "true");
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_FLAG_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures — UI-only preference.
  }
};
