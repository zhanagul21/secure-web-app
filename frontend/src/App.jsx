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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a_0%,_#020617_45%,_#000814_100%)] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-cyan-500/15 text-4xl shadow-2xl ring-1 ring-white/10">
              🔒
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-wide text-white">
              AUTHGUARD LOCKER
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Қауіпсіз құжат сақтау, басқару және шифрлау жүйесі
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <Login setLoggedIn={setLoggedIn} />

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowRegister(!showRegister)}
                className="text-lg font-medium text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
              >
                {showRegister
                  ? "Тіркелу формасын жабу"
                  : "Мен жүйеге тіркелмегенмін"}
              </button>
            </div>

            {showRegister && (
              <div className="mt-8">
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