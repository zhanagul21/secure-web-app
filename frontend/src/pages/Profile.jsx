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

      const res = await API.get("/user/2fa/setup");
      setQrCodeDataUrl(res.data.qr || "");
      setManualCode(res.data.secret || "");
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

      const res = await API.post("/user/2fa/verify", {
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

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-5 shadow-sm">
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

        {message && (
          <div className="rounded-2xl border border-sky-200 bg-white/95 px-4 py-3 text-slate-700">
            {message}
          </div>
        )}

        <div className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-sm">
          {!user ? (
            <p className="text-slate-600">Жүктелуде...</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-sky-50 p-4">
                <p><b>Аты-жөні:</b> {user.full_name}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Рөл:</b> {user.role}</p>
                <p><b>2FA:</b> {user.twofa_enabled ? "Қосулы" : "Өшірулі"}</p>
              </div>

              {!user.twofa_enabled && (
                <button
                  onClick={handleSetup2FA}
                  disabled={loading2FA}
                  className="rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  {loading2FA ? "Жүктелуде..." : "2FA қосу"}
                </button>
              )}

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
                    Кодты растау
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