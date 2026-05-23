import { useEffect, useState } from "react";
 
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyDocuments from "./pages/MyDocumentsSecure";
import AddDocument from "./pages/AddDocumentSecure";
import ActivityLog from "./pages/ActivityLog";
import AdminPanel from "./pages/AdminPanel";
import TwoFA from "./pages/TwoFA";
import TwoFASettings from "./pages/TwoFASettings";
import DocumentViewer from "./pages/DocumentViewerSecure";
import SharedDocument from "./pages/SharedDocumentSecure";
import CryptoModule from "./pages/CryptoModule";
import API from "./services/api";
import LanguageSelector from "./components/LanguageSelector";
import GlobalTranslator from "./i18n/GlobalTranslator";
import { LanguageProvider } from "./i18n/LanguageContext";
 
// ✅ ТҮЗЕТІЛДІ: pathname-ді state-ке салу керек,
// себебі window.location.pathname React render кезінде тұрақсыз
function getSharedToken() {
  const path = window.location.pathname;
  if (path.startsWith("/shared/")) {
    return path.replace("/shared/", "").trim();
  }
  return null;
}
 
function App() {
  const sharedToken = getSharedToken();

  return (
    <LanguageProvider>
      <GlobalTranslator />
      <LanguageSelector />
      {sharedToken ? <SharedDocument token={sharedToken} /> : <AuthApp />}
    </LanguageProvider>
  );
}
 
function AuthApp() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "landing"
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
    if (!token) {
      setPage((current) => (current === "register" ? current : "landing"));
    }
  }, []);
 
  const logoutEverywhere = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (localStorage.getItem("token")) {
        await API.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Local cleanup still happens if the server session was already expired.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("temp2faToken");
    setLoggedIn(false);
    setPage("landing");
    setSelectedDocumentId(null);
  };
 
  if (page === "2fa") {
    return <TwoFA setPage={setPage} setLoggedIn={setLoggedIn} />;
  }
 
  if (!loggedIn) {
    if (page === "landing") {
      return <Landing setPage={setPage} />;
    }
    if (page === "register") {
      return <Register onClose={() => setPage("login")} />;
    }
    return <Login setLoggedIn={setLoggedIn} setPage={setPage} />;
  }
 
  if (page === "dashboard") {
    return (
      <Dashboard
        setLoggedIn={setLoggedIn}
        setPage={setPage}
        setSelectedDocumentId={setSelectedDocumentId}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  if (page === "profile") {
    return (
      <Profile
        setLoggedIn={setLoggedIn}
        setPage={setPage}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  if (page === "twofaSettings") {
    return (
      <TwoFASettings
        setLoggedIn={setLoggedIn}
        setPage={setPage}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }

  if (page === "documents") {
    return (
      <MyDocuments
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        setSelectedDocumentId={setSelectedDocumentId}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  if (page === "addDocument") {
    return (
      <AddDocument
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  if (page === "logs") {
    return (
      <ActivityLog
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }

  if (page === "crypto") {
    return (
      <CryptoModule
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  if (page === "admin") {
    return (
      <AdminPanel
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  if (page === "viewer" && selectedDocumentId) {
    return (
      <DocumentViewer
        documentId={selectedDocumentId}
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        logoutEverywhere={logoutEverywhere}
      />
    );
  }
 
  // Fallback
  return <Login setLoggedIn={setLoggedIn} setPage={setPage} />;
}
 
export default App;
