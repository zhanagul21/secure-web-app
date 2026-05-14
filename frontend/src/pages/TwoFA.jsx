import { useState } from "react";
import API from "../services/api";

function TwoFA({ setPage, setLoggedIn }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const verify2FA = async (e) => {
    e.preventDefault();
    setMessage("");

    const tempToken = localStorage.getItem("temp2faToken");

    if (!tempToken) {
      setMessage("2FA сессиясы табылмады. Қайта кіріңіз.");
      return;
    }

    if (!code.trim()) {
      setMessage("2FA кодын енгізіңіз");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login-2fa", {
        tempToken,
        token: code.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("temp2faToken");
      localStorage.removeItem("tempUserEmail");
      localStorage.removeItem("tempUserRole");
      localStorage.removeItem("tempUserId");

      setLoggedIn(true);
      setPage("dashboard");
    } catch (error) {
      console.error("2FA ERROR:", error);
      setMessage(error.response?.data?.message || "2FA тексеру қатесі");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    localStorage.removeItem("temp2faToken");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setPage("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-7 shadow-sm sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200">
              🔑
            </div>

            <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
              2FA растау
            </h2>

            <p className="mt-3 text-slate-700">
              Google Authenticator ішіндегі 6 таңбалы кодты енгізіңіз
            </p>
          </div>

          <form onSubmit={verify2FA} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                2FA коды
              </label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 outline-none focus:border-sky-400"
              />
            </div>

            {message && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Артқа
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white"
              >
                {loading ? "Тексерілуде..." : "Растау"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TwoFA;
