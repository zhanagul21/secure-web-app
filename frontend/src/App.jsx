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
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center sm:mb-12">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-4xl shadow-[0_10px_40px_rgba(2,132,199,0.18)] ring-1 ring-sky-200">
              🔐
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-800 sm:text-5xl md:text-6xl">
              AUTHGUARD LOCKER
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">
              Қауіпсіз құжат сақтау, басқару және шифрлау жүйесі
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="rounded-full border border-sky-200 bg-white px-4 py-2 text-slate-700 shadow-sm">
                JWT Authentication
              </span>
              <span className="rounded-full border border-sky-200 bg-white px-4 py-2 text-slate-700 shadow-sm">
                2FA Protection
              </span>
              <span className="rounded-full border border-sky-200 bg-white px-4 py-2 text-slate-700 shadow-sm">
                AES Encryption
              </span>
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <Login setLoggedIn={setLoggedIn} />
            </div>

            <div className="order-1 rounded-[32px] border border-sky-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(2,132,199,0.14)] backdrop-blur sm:p-8 lg:order-2">
              <div className="mb-6 inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
                Secure Digital Workspace
              </div>

              <h2 className="text-3xl font-bold leading-tight text-slate-800 sm:text-4xl">
                Құжаттарыңызды қауіпсіз сақтайтын
                <span className="block text-sky-700">заманауи веб-жүйе</span>
              </h2>

              <p className="mt-4 leading-7 text-slate-700">
                AuthGuard Locker — құжаттарды жүктеу, сақтау, қарау және қорғау
                үшін жасалған дипломдық web app.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-sky-100 p-4">
                  <div className="text-2xl">🛡️</div>
                  <h3 className="mt-3 font-semibold text-slate-800">Қауіпсіз кіру</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    JWT және 2FA көмегімен сенімді аутентификация.
                  </p>
                </div>

                <div className="rounded-2xl bg-sky-100 p-4">
                  <div className="text-2xl">📄</div>
                  <h3 className="mt-3 font-semibold text-slate-800">Құжаттарды басқару</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Файл жүктеу, көру, сақтау және ашу.
                  </p>
                </div>

                <div className="rounded-2xl bg-sky-100 p-4">
                  <div className="text-2xl">🔒</div>
                  <h3 className="mt-3 font-semibold text-slate-800">AES шифрлау</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Маңызды құжаттар қорғалған түрде сақталады.
                  </p>
                </div>

                <div className="rounded-2xl bg-sky-100 p-4">
                  <div className="text-2xl">📊</div>
                  <h3 className="mt-3 font-semibold text-slate-800">Activity Logs</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Жүйедегі әрекеттер журналға түседі.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center lg:text-left">
                <button
                  onClick={() => setShowRegister(!showRegister)}
                  className="rounded-2xl bg-slate-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-slate-800"
                >
                  {showRegister ? "Тіркелу формасын жабу" : "Жаңа аккаунт ашу"}
                </button>
              </div>
            </div>
          </div>

          {showRegister && (
            <div className="mx-auto mt-8 max-w-2xl">
              <Register />
            </div>
          )}
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