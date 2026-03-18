import { useState } from "react";
import API from "../services/api";

function Register() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const sendCode = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/send-code", { email });
      setMessage(res.data.message || "Растау коды email-ға жіберілді");
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "Қате шықты");
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/verify-code", { email, code });
      setMessage(res.data.message || "Код расталды");
      setStep(3);
    } catch (error) {
      setMessage(error.response?.data?.message || "Код қате");
    }
  };

  const completeRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/complete-register", {
        full_name: fullName,
        email,
        password,
      });

      setMessage(res.data.message || "Тіркелу сәтті аяқталды");

      setStep(1);
      setEmail("");
      setCode("");
      setFullName("");
      setPassword("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Тіркелу қатесі");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Тіркелу</h2>

      <div className="flex gap-2 mb-6">
        <div
          className={`h-2 flex-1 rounded ${
            step >= 1 ? "bg-cyan-600" : "bg-slate-200"
          }`}
        ></div>
        <div
          className={`h-2 flex-1 rounded ${
            step >= 2 ? "bg-cyan-600" : "bg-slate-200"
          }`}
        ></div>
        <div
          className={`h-2 flex-1 rounded ${
            step >= 3 ? "bg-cyan-600" : "bg-slate-200"
          }`}
        ></div>
      </div>

      {step === 1 && (
        <form onSubmit={sendCode} className="space-y-4">
          <input
            type="email"
            placeholder="Email енгізіңіз"
            className="w-full p-3 border rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="w-full bg-cyan-600 text-white p-3 rounded-xl hover:bg-cyan-700">
            Код жіберу
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyCode} className="space-y-4">
          <input
            type="text"
            placeholder="6 таңбалы код"
            className="w-full p-3 border rounded-xl"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">
            Кодты растау
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={completeRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Аты-жөні"
            className="w-full p-3 border rounded-xl"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="password"
            placeholder="Пароль ойлап табыңыз"
            className="w-full p-3 border rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600">
            Тіркелуді аяқтау
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

export default Register;