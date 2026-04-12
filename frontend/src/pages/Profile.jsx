import { useEffect, useState } from "react";
import API from "../services/api";

function Profile({ setLoggedIn, setPage, logoutEverywhere }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);

  // 🔥 ТОЛЫҚ LOGOUT FIX
  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 🔴 МАҢЫЗДЫ
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("temp2faToken");

    setLoggedIn(false);
    setPage("login");
  };

  const getProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data.user);
    } catch (error) {
      setMessage("Профиль жүктеу қатесі");
    }
  };

  // 🔥 QR GENERATE
  const handleSetup2FA = async () => {
    try {
      setLoading2FA(true);
      setMessage("");

      const res = await API.get("/user/2fa/setup");

      setQrCodeDataUrl(res.data.qr || "");
      setManualCode(res.data.secret || "");
      setShow2FASetup(true);

      setMessage("QR кодты сканерлеп, код енгізіңіз");
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA setup қатесі");
    } finally {
      setLoading2FA(false);
    }
  };

  // 🔥 ENABLE 2FA
  const handleEnable2FA = async () => {
    if (!otpCode.trim()) {
      setMessage("Код енгізіңіз");
      return;
    }

    try {
      setLoading2FA(true);
      setMessage("");

      const res = await API.post("/user/2fa/verify", {
        token: otpCode.trim(),
      });

      setMessage(res.data.message || "2FA сәтті қосылды");

      // reset
      setShow2FASetup(false);
      setOtpCode("");
      setQrCodeDataUrl("");
      setManualCode("");

      // reload profile
      getProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA қосу қатесі");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("2FA өшіру керек пе?")) return;

    try {
      setLoading2FA(true);
      setMessage("");
      const res = await API.post("/user/2fa/disable", {});
      setMessage(res.data.message || "2FA өшірілді");
      getProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA өшіру қатесі");
    } finally {
      setLoading2FA(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
          <h1 className="mt-1 text-3xl font-black text-slate-800">
            Профиль және 2FA қауіпсіздігі
          </h1>
          <p className="mt-2 text-slate-600">
            Аккаунт мәліметтері, екі факторлы аутентификация және қауіпсіздік баптаулары.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setPage("dashboard")}
              className="rounded-xl bg-slate-700 px-4 py-2 text-white"
            >
              Басты бет
            </button>

            <button
              onClick={() => setPage("documents")}
              className="rounded-xl bg-slate-700 px-4 py-2 text-white"
            >
              Құжаттар
            </button>

            <button
              onClick={logout}
              className="rounded-xl bg-red-500 px-4 py-2 text-white"
            >
              Шығу
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="rounded-2xl border border-sky-200 bg-white/95 px-4 py-3 text-slate-700">
            {message}
          </div>
        )}

        {/* PROFILE */}
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          {!user ? (
            <p className="text-slate-600">Жүктелуде...</p>
          ) : (
            <div className="space-y-6">

              {/* USER INFO */}
              <div className="rounded-2xl bg-sky-50 p-4 space-y-2">
                <p><b>Аты-жөні:</b> {user.full_name}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Рөл:</b> {user.role}</p>

                <p>
                  <b>2FA:</b>{" "}
                  <span
                    className={`px-2 py-1 rounded-lg ${
                      user.twofa_enabled
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {user.twofa_enabled ? "Қосулы" : "Өшірулі"}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="text-xl font-bold text-emerald-900">
                  2FA қалай қосылады?
                </h3>
                <p className="mt-2 text-emerald-900">
                  Телефонға <b>Google Authenticator</b>, <b>Microsoft Authenticator</b>
                  немесе <b>2FAS Auth</b> орнатып, QR кодты сканерлеңіз.
                  Содан кейін app ішіндегі 6 таңбалы кодты осы жерде енгізесіз.
                </p>
              </div>

              {!user.twofa_enabled ? (
                <button
                  onClick={handleSetup2FA}
                  disabled={loading2FA}
                  className="rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  {loading2FA ? "Жүктелуде..." : "2FA қосу"}
                </button>
              ) : (
                <button
                  onClick={handleDisable2FA}
                  disabled={loading2FA}
                  className="rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white"
                >
                  {loading2FA ? "Өшірілуде..." : "2FA өшіру"}
                </button>
              )}

              {/* QR BLOCK */}
              {show2FASetup && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">

                  {qrCodeDataUrl && (
                    <img
                      src={qrCodeDataUrl}
                      alt="2FA QR"
                      className="mb-4 max-w-[240px]"
                    />
                  )}

                  {manualCode && (
                    <p className="mb-4 break-all text-sm text-slate-700">
                      Қолмен енгізу коды: <b>{manualCode}</b>
                    </p>
                  )}

                  <p className="mb-4 text-sm text-slate-700">
                    QR сканерлейтін app: Google Authenticator / Microsoft Authenticator / 2FAS Auth.
                  </p>

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6 таңбалы код"
                    className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none"
                  />

                  <button
                    onClick={handleEnable2FA}
                    disabled={loading2FA}
                    className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white"
                  >
                    {loading2FA ? "Расталуда..." : "Кодты растау"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
