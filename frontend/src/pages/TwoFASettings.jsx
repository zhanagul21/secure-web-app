import { useEffect, useState } from "react";
import API from "../services/api";

function TwoFASettings({ setPage, setLoggedIn, logoutEverywhere }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
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
    } catch {
      setMessage("2FA беті үшін деректер жүктелмеді");
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await API.get("/user/2fa/setup");
      setQrCodeDataUrl(res.data.qr || "");
      setManualCode(res.data.secret || "");
      setShowSetup(true);
      setMessage("QR код дайын. Аутентификатор арқылы сканерлеп, 6 таңбалы кодты енгізіңіз.");
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA баптау қатесі");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!otpCode.trim()) {
      setMessage("6 таңбалы кодты енгізіңіз");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const res = await API.post("/user/2fa/verify", { token: otpCode.trim() });
      setMessage(res.data.message || "2FA қосылды");
      setShowSetup(false);
      setOtpCode("");
      setQrCodeDataUrl("");
      setManualCode("");
      getProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA растау қатесі");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await API.post("/user/2fa/disable", {});
      setMessage(res.data.message || "2FA өшірілді");
      setShowSetup(false);
      setOtpCode("");
      setQrCodeDataUrl("");
      setManualCode("");
      getProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA өшіру қатесі");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#eff6ff_36%,#f8fafc_100%)] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">2FA баптау</h1>
              <p className="mt-2 text-slate-600">Аккаунтқа екі факторлы аутентификацияны қосу немесе өшіру.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={() => setPage("profile")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Профиль</button>
              <button onClick={logout} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-sky-100 bg-white/95 px-4 py-3 text-slate-700 shadow-sm">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
              <div className="text-sm uppercase tracking-[0.18em] text-sky-700">Қауіпсіздік статусы</div>
              <div className="mt-4 text-3xl font-black text-slate-900">{user?.twofa_enabled ? "2FA қосулы" : "2FA өшірулі"}</div>
              <p className="mt-3 text-slate-600">Бұл функция аккаунтқа кіргенде қосымша бір реттік код сұратады.</p>
            </div>

            <div className="mt-6 rounded-3xl border border-sky-100 bg-sky-50 p-5">
              <div className="text-sm font-semibold text-slate-800">Сканерлейтін қолданбалар</div>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>2FAS Auth</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            {!user?.twofa_enabled ? (
              <div>
                <h2 className="text-2xl font-black text-slate-900">2FA қосу</h2>
                <p className="mt-2 text-slate-600">QR кодты сканерлеп, қолданбадағы 6 таңбалы кодпен растаңыз.</p>

                {!showSetup ? (
                  <button onClick={handleSetup2FA} disabled={loading} className="mt-6 rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white">
                    {loading ? "Жүктелуде..." : "QR код жасау"}
                  </button>
                ) : (
                  <div className="mt-6 space-y-5">
                    {qrCodeDataUrl && (
                      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
                        <img src={qrCodeDataUrl} alt="2FA QR" className="mx-auto max-w-[240px]" />
                      </div>
                    )}

                    {manualCode && (
                      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">
                        Қолмен енгізу коды: <b>{manualCode}</b>
                      </div>
                    )}

                    <input
                      type="text"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value)}
                      placeholder="6 таңбалы код"
                      className="w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 outline-none focus:border-sky-300"
                    />

                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleEnable2FA} disabled={loading} className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white">
                        {loading ? "Расталуда..." : "2FA қосу"}
                      </button>
                      <button
                        onClick={() => {
                          setShowSetup(false);
                          setOtpCode("");
                          setQrCodeDataUrl("");
                          setManualCode("");
                        }}
                        className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                      >
                        Болдырмау
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-slate-900">2FA өшіру</h2>
                <p className="mt-2 text-slate-600">Қажет болса, екі факторлы аутентификацияны бір батырмамен өшіре аласыз.</p>
                <button onClick={handleDisable2FA} disabled={loading} className="mt-6 rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white">
                  {loading ? "Өшірілуде..." : "2FA өшіру"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFASettings;
