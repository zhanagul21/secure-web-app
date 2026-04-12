import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function MyDocumentsSecure({ setPage, setLoggedIn, setSelectedDocumentId }) {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const getDocuments = async () => {
    try {
      const res = await API.get("/documents/my");
      setDocuments(res.data.documents || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Құжаттарды жүктеу кезінде қате шықты.");
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const deleteDoc = async (id) => {
    if (!window.confirm("Осы құжатты өшіргіңіз келе ме?")) return;
    try {
      await API.delete(`/documents/delete/${id}`);
      getDocuments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Құжатты өшіру кезінде қате шықты.");
    }
  };

  const downloadDoc = async (id, fileName) => {
    try {
      const response = await API.get(`/documents/download/${id}`, { responseType: "blob" });
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      setMessage(error.response?.data?.message || "Құжатты жүктеу кезінде қате шықты.");
    }
  };

  const categories = useMemo(() => [...new Set(documents.map((doc) => doc.category).filter(Boolean))], [documents]);

  const filteredDocuments = useMemo(() => {
    const searchText = search.toLowerCase();
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title?.toLowerCase().includes(searchText) ||
        doc.description?.toLowerCase().includes(searchText) ||
        doc.category?.toLowerCase().includes(searchText) ||
        doc.original_name?.toLowerCase().includes(searchText);
      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [documents, search, categoryFilter]);

  const getFileTypeLabel = (mimeType, name) => {
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType?.startsWith("image/")) return "Сурет";
    if (mimeType === "application/msword") return "DOC";
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
    if (mimeType === "application/vnd.ms-powerpoint") return "PPT";
    if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "PPTX";
    if (mimeType === "text/plain") return "TXT";
    return name ? "Құжат" : "Файл жоқ";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">Менің қорғалған құжаттарым</h1>
              <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                Құжаттар серверде шифрланған түрде сақталады, ашу және жүктеу кезінде автоматты дешифрланады.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={() => setPage("addDocument")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Жаңа құжат</button>
              <button onClick={logout} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Құжат атауы, категория немесе файл аты бойынша іздеу" className="md:col-span-2 rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none" />
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none">
              <option value="all">Барлық категория</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {message && <div className="mt-6 rounded-2xl border border-sky-200 bg-white/90 px-4 py-4 text-slate-700 shadow-sm">{message}</div>}

        {filteredDocuments.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-sky-200 bg-white/90 p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800">Құжаттар табылмады</h2>
            <p className="mt-2 text-slate-700">Жаңа қорғалған құжат жүктеп көріңіз.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="rounded-[28px] border border-sky-200 bg-white/90 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-semibold text-slate-900">{doc.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{doc.category || "Категория жоқ"}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-slate-700">{getFileTypeLabel(doc.mime_type, doc.original_name)}</span>
                </div>

                <p className="mt-4 min-h-[48px] text-slate-700">{doc.description || "Сипаттама жоқ"}</p>

                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-800">Шифрлау статусы</p>
                  <p className="mt-1 text-sm text-emerald-900">Серверде шифрланған күйде сақталады</p>
                  <p className="mt-2 text-xs text-slate-600">Preview және download кезінде дешифрланады</p>
                </div>

                {doc.original_name && <p className="mt-4 break-all text-sm text-slate-600">Файл: {doc.original_name}</p>}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => { setSelectedDocumentId(doc.id); setPage("viewer"); }} className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white">Ашу</button>
                  <button onClick={() => downloadDoc(doc.id, doc.original_name)} className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white">Дешифрлап жүктеу</button>
                  <button onClick={() => deleteDoc(doc.id)} className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white">Өшіру</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDocumentsSecure;
