export const GRUDA_CONSENT_STORAGE_KEY = "gruda-widget-consent";

export type GrudaConsentChoice = "accepted" | "declined";

export function getGrudaConsentChoice(): GrudaConsentChoice | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(GRUDA_CONSENT_STORAGE_KEY);
  if (value === "accepted" || value === "true") return "accepted";
  if (value === "declined") return "declined";
  return null;
}

export function hasGrudaConsent(): boolean {
  return getGrudaConsentChoice() === "accepted";
}

export function setGrudaConsent(): void {
  localStorage.setItem(GRUDA_CONSENT_STORAGE_KEY, "accepted");
}

export function declineGrudaConsent(): void {
  localStorage.setItem(GRUDA_CONSENT_STORAGE_KEY, "declined");
}

export function resetGrudaConsentChoice(): void {
  localStorage.removeItem(GRUDA_CONSENT_STORAGE_KEY);
}

export function loadGrudaIframeScript(): void {
  const grudaWindow = window as Window & {
    options?: { refererId: number };
  };
  grudaWindow.options = { refererId: 2272 };

  if (document.getElementById("gruda_iframe_script")) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://www.gruda.lt/iframe.js";
  script.async = true;
  script.id = "gruda_iframe_script";
  document.body.appendChild(script);
}

export function clearGrudaWidget(): void {
  document.getElementById("gruda_iframe_script")?.remove();
  const iframeContainer = document.getElementById("gruda_iframe");
  if (iframeContainer) {
    iframeContainer.innerHTML = "";
  }
}
