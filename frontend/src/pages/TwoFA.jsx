import { useEffect, useState } from "react";
import API from "../services/api";

function TwoFA({ setPage, setLoggedIn }) {
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const loadQR = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await API.get("/user/2fa/setup", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQr(res.data.qr || "");
      setSecret(res.data.secret || "");
      setMessage("");
    } catch (error) {
      console.error("2FA SETUP ERROR:", error);
      setMessage(
        error.response?.data?.message || "QR кодты жүктеу кезінде қате шықты"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setMessage("6 таңбалы кодты енгізіңіз");
      return;
    }

    try {
      setVerifying(true);

      const token = localStorage.getItem("token");

      const res = await API.post(
        "/user/2fa/verify",
        { token: code.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "2FA сәтті қосылды");
      setCode("");
    } catch (error) {
      console.error("2FA VERIFY ERROR:", error);
      setMessage(error.response?.data?.message || "Код қате");
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = async () => {
    try {
      if (!secret) return;
      await navigator.clipboard.writeText(secret);
      setMessage("Құпия кілт көшірілді");
    } catch (error) {
      console.error("COPY SECRET ERROR:", error);
      setMessage("Құпия кілтті көшіру мүмкін болмады");
    }
  };

  useEffect(() => {
    loadQR();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Екі факторлы аутентификация</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("profile")}
            className="bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl"
          >
            Профиль
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-semibold mb-2">2FA қалай жұмыс істейді?</h3>
          <p className="text-slate-600">
            Екі факторлы аутентификация аккаунтқа кіру кезінде қосымша 6 таңбалы
            бірреттік кодты талап етеді. Бұл пароль ұрланған жағдайда да
            аккаунтты қорғауға көмектеседі.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">
            Google Authenticator немесе ұқсас қолданбаны қосу
          </h2>

          <p className="text-slate-600 mb-6">
            Телефоныңыздағы аутентификатор қолданбасымен QR кодты сканерлеңіз.
            Содан кейін шыққан 6 таңбалы кодты енгізіп растаңыз.
          </p>

          {message && (
            <div className="mb-6 bg-slate-50 border rounded-2xl p-4 text-slate-700">
              {message}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-2xl p-6 border">
              <h3 className="font-semibold mb-4">1-қадам: QR сканерлеу</h3>

              {loading ? (
                <div className="h-72 flex items-center justify-center text-slate-500">
                  QR жүктелуде...
                </div>
              ) : qr ? (
                <img
                  src={qr}
                  alt="2FA QR"
                  className="w-64 h-64 object-contain mx-auto bg-white rounded-2xl border p-3"
                />
              ) : (
                <div className="h-72 flex items-center justify-center text-slate-500 text-center">
                  QR код жүктелмеді
                </div>
              )}

              {secret && (
                <div className="mt-5">
                  <p className="text-sm text-slate-500 mb-2">
                    Егер QR сканерленбесе, мына кілтті қолмен енгізіңіз:
                  </p>

                  <div className="bg-white border rounded-xl p-3 break-all text-sm text-slate-800">
                    {secret}
                  </div>

                  <button
                    onClick={copySecret}
                    className="mt-3 bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-900"
                  >
                    Кілтті көшіру
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border">
              <h3 className="font-semibold mb-4">2-қадам: Кодты растау</h3>

              <form onSubmit={verifyCode} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    6 таңбалы код
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Мысалы: 123456"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full border p-3 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-60"
                >
                  {verifying ? "Тексерілуде..." : "2FA растау"}
                </button>
              </form>

              <div className="mt-6 bg-white rounded-2xl border p-4">
                <h4 className="font-medium text-slate-900 mb-2">Нұсқаулық</h4>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal pl-5">
                  <li>Authenticator қолданбасын ашыңыз.</li>
                  <li>Жаңа аккаунт қосыңыз.</li>
                  <li>QR кодты сканерлеңіз немесе кілтті қолмен енгізіңіз.</li>
                  <li>Шыққан 6 таңбалы кодты осы жерге жазыңыз.</li>
                </ol>
              </div>

              <button
                onClick={loadQR}
                className="mt-4 w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600"
              >
                QR кодты қайта жүктеу
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFA;