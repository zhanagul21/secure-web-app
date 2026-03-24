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
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-[#f7fbff] to-blue-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-800">Құжаттар</h1>
          <p className="mt-2 text-slate-600">
            Жүйедегі барлық құжаттар тізімі
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-[28px] border border-sky-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-slate-900">{doc.title}</h2>

              <p className="mt-1 text-slate-500">{doc.category}</p>

              <div className="mt-4 flex gap-2">
                <a
                  href={`http://localhost:5000/api/documents/download/${doc.id}`}
                  className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                >
                  Жүктеу
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Documents;