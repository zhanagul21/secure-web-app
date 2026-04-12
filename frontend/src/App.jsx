import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyDocuments from "./pages/MyDocuments";
import AddDocument from "./pages/AddDocument";
import ActivityLog from "./pages/ActivityLog";
import AdminPanel from "./pages/AdminPanel";
import TwoFA from "./pages/TwoFA";
import DocumentViewer from "./pages/DocumentViewer";
import SharedDocument from "./pages/SharedDocument";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith("/shared/")) return;

    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
    setPage(token ? "dashboard" : "login");
  }, []);

  const logoutEverywhere = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");

    setLoggedIn(false);
    setPage("login");
    setSelectedDocumentId(null);
  };

  const path = window.location.pathname;

  if (path.startsWith("/shared/")) {
    const token = path.split("/shared/")[1];
    return <SharedDocument token={token} />;
  }

  if (page === "2fa") {
    return <TwoFA setPage={setPage} setLoggedIn={setLoggedIn} />;
  }

  if (!loggedIn) {
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
      />
    );
  }

  return <Login setLoggedIn={setLoggedIn} setPage={setPage} />;
}

export default App;