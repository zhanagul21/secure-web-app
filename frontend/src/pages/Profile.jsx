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

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    setLoggedIn(false);
  };

  const getProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data.user);
    } catch (error) {
      setMessage("Профиль жүктеу қатесі");
    }
  };

  const handleSetup2FA = async () => {
    try {
      setLoading2FA(true);
      setMessage("");

      const res = await API.post("/auth/setup-2fa");
      setQrCodeDataUrl(res.data.qrCodeDataUrl);
      setManualCode(res.data.manualCode);
      setShow2FASetup(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA setup қатесі");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading2FA(true);
      setMessage("");

      const res = await API.post("/auth/enable-2fa", {
        token: otpCode,
      });

      setMessage(res.data.message || "2FA сәтті қосылды");
      setShow2FASetup(false);
      setOtpCode("");
      setQrCodeDataUrl("");
      setManualCode("");
      getProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA қосу қатесі");
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading2FA(true);
      setMessage("");

      const res = await API.post("/auth/disable-2fa");
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
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl">
                👤
              </div>

              <div>
                <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
                <h1 className="text-2xl font-bold text-slate-800">Профиль</h1>
                <p className="text-sm text-slate-600">Аккаунт мәліметтері</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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
                className="rounded-xl bg-slate-700 px-4 py-2 text-white"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-sky-200 bg-white/95 px-4 py-3 text-slate-700">
            {message}
          </div>
        )}

        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          {!user ? (
            <p className="text-slate-600">Жүктелуде...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">Аты-жөні</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.full_name || "Көрсетілмеген"}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">Рөлі</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.role}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm text-slate-500">2FA</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.twofa_enabled ? "Қосылған" : "Қосылмаған"}
                </p>
              </div>

              <div className="rounded-2xl bg-sky-50 p-4 sm:col-span-2">
                <p className="text-sm text-slate-500">Тіркелген уақыты</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "Белгісіз"}
                </p>
              </div>
            </div>
          )}

          {user && !user.twofa_enabled && (
            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <h3 className="text-lg font-bold text-slate-800">2FA қосу</h3>
              <p className="mt-2 text-sm text-slate-600">
                Google Authenticator арқылы екі факторлы аутентификацияны қосыңыз
              </p>

              {!show2FASetup ? (
                <button
                  onClick={handleSetup2FA}
                  disabled={loading2FA}
                  className="mt-4 rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  {loading2FA ? "Дайындалуда..." : "2FA баптау"}
                </button>
              ) : (
                <div className="mt-4 space-y-4">
                  {qrCodeDataUrl && (
                    <div className="rounded-2xl bg-white p-4">
                      <img
                        src={qrCodeDataUrl}
                        alt="2FA QR"
                        className="mx-auto max-w-[220px]"
                      />
                    </div>
                  )}

                  {manualCode && (
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-sm text-slate-500">Қолмен енгізу коды</p>
                      <p className="mt-2 break-all font-semibold text-slate-800">
                        {manualCode}
                      </p>
                    </div>
                  )}

                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Authenticator кодын енгізіңіз"
                    className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none"
                  />

                  <button
                    onClick={handleEnable2FA}
                    disabled={loading2FA}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white"
                  >
                    {loading2FA ? "Қосылуда..." : "2FA қосу"}
                  </button>
                </div>
              )}
            </div>
          )}

          {user && user.twofa_enabled && (
            <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">
              <h3 className="text-lg font-bold text-slate-800">2FA басқару</h3>
              <p className="mt-2 text-sm text-slate-600">
                Екі факторлы аутентификация қосылған
              </p>

              <button
                onClick={handleDisable2FA}
                disabled={loading2FA}
                className="mt-4 rounded-2xl bg-rose-600 px-5 py-3 font-semibold text-white"
              >
                {loading2FA ? "Өшірілуде..." : "2FA өшіру"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;