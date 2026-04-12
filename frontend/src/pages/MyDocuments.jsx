import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function MyDocuments({ setPage, setLoggedIn, setSelectedDocumentId }) {
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
      setMessage("Құжаттарды жүктеу кезінде қате шықты");
    }
  };

  const deleteDoc = async (id) => {
    const ok = window.confirm("Осы құжатты өшіргіңіз келе ме?");
    if (!ok) return;

    try {
      await API.delete(`/documents/delete/${id}`);
      getDocuments();
    } catch (error) {
      setMessage("Құжатты өшіру кезінде қате шықты");
    }
  };

  const downloadDoc = async (id, fileName) => {
    try {
      const response = await API.get(`/documents/download/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);
      setMessage("Құжатты жүктеу кезінде қате шықты");
    }
  };

  const shareDocument = async (id) => {
    try {
      const res = await API.post(`/documents/share/${id}`, {
        durationMinutes: 60,
      });

      const shareUrl = res.data.shareUrl;

      if (!shareUrl) {
        setMessage("Ссылка жасалмады");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      alert(`Ссылка көшірілді:\n\n${shareUrl}\n\nУақыты: 1 сағат`);
    } catch (error) {
      console.error("SHARE ERROR:", error);
      setMessage(
        error.response?.data?.message || "Ссылка жасау кезінде қате шықты"
      );
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(documents.map((doc) => doc.category).filter(Boolean))];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        doc.title?.toLowerCase().includes(searchText) ||
        doc.description?.toLowerCase().includes(searchText) ||
        doc.category?.toLowerCase().includes(searchText) ||
        doc.original_name?.toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "all" ? true : doc.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [documents, search, categoryFilter]);

  const getFileTypeLabel = (mimeType, name) => {
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType?.startsWith("image/")) return "Сурет";
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "DOCX";
    }
    if (mimeType === "application/msword") return "DOC";
    if (mimeType === "application/vnd.ms-powerpoint") return "PPT";
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "PPTX";
    }
    if (mimeType === "text/plain") return "TXT";
    if (name) return "Құжат";
    return "Файл жоқ";
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") return "📄";
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "📝";
    }
    if (
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "📊";
    }
    if (mimeType === "text/plain") return "📃";
    return "📁";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200">
                📁
              </div>

              <div>
                <p className="text-sm font-medium text-sky-700">
                  AuthGuard Locker
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Менің құжаттарым
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                  Құжаттарды іздеу, қарау, жүктеу, бөлісу және өшіру бөлімі
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Басты бет
              </button>

              <button
                onClick={() => setPage("addDocument")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Жаңа құжат
              </button>

              <button
                onClick={logout}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold text-slate-800">
            Қолдау көрсетілетін файлдар
          </h3>
          <p className="mt-2 text-slate-700">
            PDF, PNG, JPG, JPEG, DOC, DOCX, PPT, PPTX, TXT
          </p>
        </div>

        <div className="mt-6 rounded-[28px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Іздеу
              </label>
              <input
                type="text"
                placeholder="Құжат атауы, категория, сипаттама немесе файл аты бойынша іздеу"
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Категория
              </label>
              <select
                className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Барлығы</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-sky-200 bg-white/90 px-4 py-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {filteredDocuments.length === 0 ? (
          <div className="mt-6 rounded-[32px] border border-sky-200 bg-white/90 p-10 text-center shadow-sm">
            <div className="text-5xl">📂</div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-800">
              Құжаттар табылмады
            </h2>
            <p className="mt-2 text-slate-700">
              Іздеу нәтижесі бос немесе жүйеде әлі құжат жоқ.
            </p>
            <button
              onClick={() => setPage("addDocument")}
              className="mt-5 rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Құжат қосу
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-[28px] border border-sky-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl ring-1 ring-sky-200">
                      {getFileIcon(doc.mime_type)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-semibold text-slate-900">
                        {doc.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {doc.category || "Категория жоқ"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {getFileTypeLabel(doc.mime_type, doc.original_name)}
                  </span>
                </div>

                <p className="mb-4 min-h-[48px] text-slate-700">
                  {doc.description || "Сипаттама жоқ"}
                </p>

                <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-100 p-4">
                  <p className="text-sm text-slate-600">Құрылған уақыты</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleString()
                      : "-"}
                  </p>

                  {doc.original_name && (
                    <p className="mt-2 break-all text-sm text-slate-600">
                      Файл: {doc.original_name}
                    </p>
                  )}

                  {doc.file_size > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Өлшемі: {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {doc.filename ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedDocumentId(doc.id);
                          setPage("viewer");
                        }}
                        className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                      >
                        Ашу
                      </button>

                      <button
                        onClick={() => downloadDoc(doc.id, doc.original_name)}
                        className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                      >
                        Жүктеу
                      </button>

                      <button
                        onClick={() => shareDocument(doc.id)}
                        className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                      >
                        Бөлісу
                      </button>
                    </>
                  ) : (
                    <span className="rounded-xl bg-sky-100 px-4 py-2 text-slate-700">
                      Файл жоқ
                    </span>
                  )}

                  <button
                    className="rounded-xl bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
                    onClick={() => deleteDoc(doc.id)}
                  >
                    Өшіру
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

export default MyDocuments;