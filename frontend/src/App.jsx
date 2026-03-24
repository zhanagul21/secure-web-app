import { useState } from "react";

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

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");
  const [showRegister, setShowRegister] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  if (!loggedIn) {
    return <Login setLoggedIn={setLoggedIn} />;
  }

  if (page === "dashboard") {
    return (
      <Dashboard
        setLoggedIn={setLoggedIn}
        setPage={setPage}
        setSelectedDocumentId={setSelectedDocumentId}
      />
    );
  }

  if (page === "profile") {
    return <Profile setLoggedIn={setLoggedIn} setPage={setPage} />;
  }

  if (page === "documents") {
    return (
      <MyDocuments
        setPage={setPage}
        setLoggedIn={setLoggedIn}
        setSelectedDocumentId={setSelectedDocumentId}
      />
    );
  }

  if (page === "addDocument") {
    return <AddDocument setPage={setPage} setLoggedIn={setLoggedIn} />;
  }

  if (page === "logs") {
    return <ActivityLog setPage={setPage} setLoggedIn={setLoggedIn} />;
  }

  if (page === "admin") {
    return <AdminPanel setPage={setPage} setLoggedIn={setLoggedIn} />;
  }

  if (page === "2fa") {
    return <TwoFA setPage={setPage} setLoggedIn={setLoggedIn} />;
  }

  if (page === "viewer") {
    return (
      <DocumentViewer
        documentId={selectedDocumentId}
        setPage={setPage}
        setLoggedIn={setLoggedIn}
      />
    );
  }

  return null;
}

export default App;