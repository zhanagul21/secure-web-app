import { useState } from "react";
import API from "../services/api";

function Login({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twofaCode, setTwofaCode] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (res.data.requires2fa) {
        setRequires2fa(true);
        setMessage("Google Authenticator кодын енгізіңіз");
        return;
      }

      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Кіру қатесі");
    }
  };

  const verify2FA = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/auth/login-2fa", {
        email,
        token: twofaCode,
      });

      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "2FA қатесі");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Жүйеге кіру</h2>

      {!requires2fa ? (
        <form onSubmit={login} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Пароль"
            className="w-full p-3 border rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-cyan-600 text-white p-3 rounded-xl hover:bg-cyan-700">
            Кіру
          </button>
        </form>
      ) : (
        <form onSubmit={verify2FA} className="space-y-4">
          <input
            type="text"
            placeholder="Google Authenticator коды"
            className="w-full p-3 border rounded-xl"
            value={twofaCode}
            onChange={(e) => setTwofaCode(e.target.value)}
          />

          <button className="w-full bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600">
            2FA арқылы кіру
          </button>
        </form>
      )}

      {message && (
        <div className="mt-5 bg-slate-100 border rounded-xl p-3 text-slate-700 text-sm">
          {message}
        </div>
      )}
    </div>
  );
}

export default Login;