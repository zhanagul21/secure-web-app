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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6">
        <div className="max-w-5xl mx-auto pt-10">
          <div className="text-center text-white mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
              AUTHGUARD LOCKER
            </h1>
            <p className="mt-3 text-slate-300 text-lg">
              Қауіпсіз құжат сақтау және басқару жүйесі
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <Login setLoggedIn={setLoggedIn} />

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowRegister(!showRegister)}
                className="text-cyan-300 hover:text-cyan-200 underline"
              >
                {showRegister
                  ? "Тіркелу формасын жабу"
                  : "Мен жүйеге тіркелмегенмін"}
              </button>
            </div>

            {showRegister && (
              <div className="mt-6">
                <Register />
              </div>
            )}
          </div>
        </div>
      </div>
    );
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