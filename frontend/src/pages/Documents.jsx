import { useEffect, useState } from "react";
import API from "../services/api";

function Documents() {
  const [docs, setDocs] = useState([]);

  const loadDocs = async () => {
    const token = localStorage.getItem("token");

    const res = await API.get("/documents", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDocs(res.data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                Құжаттар
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Жүйедегі барлық құжаттар тізімі. Қауіпсіз түрде жүктеп алып,
                қажет файлдарды жылдам қарауға болады.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-3xl shadow-sm ring-1 ring-sky-100">
              📁
            </div>
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="rounded-[32px] border border-sky-100 bg-white/95 p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-4xl ring-1 ring-sky-100">
              ☁️
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              Құжаттар табылмады
            </h2>
            <p className="mt-2 text-slate-600">
              Әзірше жүйеде құжаттар жоқ немесе олар жүктелмеген.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="group rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">
                    📄
                  </div>

                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    ID: {doc.id}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold leading-snug text-slate-900">
                  {doc.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {doc.category || "Категория көрсетілмеген"}
                </p>

                <div className="mt-6 rounded-2xl bg-sky-50/70 p-4">
                  <p className="text-sm text-slate-500">Құжат жайлы</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    Қауіпсіз жүктеу қолжетімді
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`http://localhost:5000/api/documents/download/${doc.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Жүктеу
                  </a>
  
                  <button
                    className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-sky-50"
                    type="button"
                  >
                    Толығырақ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;