const LOCAL_API_BASE_URL = "http://localhost:5000/api";
const PUBLIC_API_BASE_URL = "https://authguard-backend-7mbc.onrender.com/api";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);
const configuredUsesLocalhost =
  !!configuredApiBaseUrl &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredApiBaseUrl);
const configuredUsesRetiredBackend =
  !!configuredApiBaseUrl &&
  (configuredApiBaseUrl.includes("secure-web-app-backend.onrender.com") ||
    configuredApiBaseUrl.includes("authguard-backend-docker.onrender.com"));
const safeConfiguredApiBaseUrl =
  (configuredUsesLocalhost && !isLocalBrowser) || configuredUsesRetiredBackend
    ? ""
    : configuredApiBaseUrl;

export const apiBaseUrl =
  safeConfiguredApiBaseUrl ||
  (isLocalBrowser ? LOCAL_API_BASE_URL : PUBLIC_API_BASE_URL);

export const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
export const apiTimeoutMs = 180000;

export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.code === "ECONNABORTED") {
    return "Сервер ұзақ жауап берді. Қайта байқап көріңіз.";
  }

  if (error?.message === "Network Error") {
    return "Серверге қосылу мүмкін болмады. Backend адресін тексеріңіз.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.errorDetail ||
    fallbackMessage
  );
}

export function getFetchErrorMessage(error, fallbackMessage) {
  if (error instanceof TypeError) {
    return "Серверге қосылу мүмкін болмады. Сілтеме конфигін тексеріңіз.";
  }

  return fallbackMessage;
}
