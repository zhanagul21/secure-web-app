import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function MyDocuments({ setPage, setLoggedIn, setSelectedDocumentId }) {
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  const getDocuments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/documents/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      const token = localStorage.getItem("token");

      await API.delete(`/documents/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      getDocuments();
    } catch (error) {
      setMessage("Құжатты өшіру кезінде қате шықты");
    }
  };

  const downloadDoc = async (id, fileName) => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get(`/documents/download/${id}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Менің құжаттарым</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPage("dashboard")}
            className="bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl"
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("addDocument")}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl"
          >
            Жаңа құжат
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-semibold mb-2">Қолдау көрсетілетін файлдар</h3>
          <p className="text-slate-600">
            PDF, PNG, JPG, JPEG, DOC, DOCX, PPT, PPTX, TXT
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Іздеу</label>
              <input
                type="text"
                placeholder="Құжат атауы, категория, сипаттама немесе файл аты бойынша іздеу"
                className="w-full border rounded-xl p-3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Категория</label>
              <select
                className="w-full border rounded-xl p-3"
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
          <div className="mb-4 bg-white border rounded-xl p-4 text-slate-700">
            {message}
          </div>
        )}

        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-10 text-center text-slate-600">
            <h2 className="text-2xl font-semibold mb-3">Құжаттар табылмады</h2>
            <p className="mb-5">Іздеу нәтижесі бос немесе жүйеде әлі құжат жоқ.</p>
            <button
              onClick={() => setPage("addDocument")}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
            >
              Құжат қосу
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-3xl shadow-md p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getFileIcon(doc.mime_type)}</span>

                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{doc.category}</p>
                    </div>
                  </div>

                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {getFileTypeLabel(doc.mime_type, doc.original_name)}
                  </span>
                </div>

                <p className="text-slate-700 mb-4 min-h-[48px]">
                  {doc.description || "Сипаттама жоқ"}
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 mb-4 border">
                  <p className="text-sm text-slate-500">Құрылған уақыты</p>
                  <p className="text-sm text-slate-800 mt-1">
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleString()
                      : "-"}
                  </p>

                  {doc.original_name && (
                    <p className="text-sm text-slate-500 mt-2 break-all">
                      Файл: {doc.original_name}
                    </p>
                  )}

                  {doc.file_size > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      Өлшемі: {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {doc.secret_content ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedDocumentId(doc.id);
                          setPage("viewer");
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                      >
                        Ашу
                      </button>

                      <button
                        onClick={() => downloadDoc(doc.id, doc.original_name)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700"
                      >
                        Жүктеу
                      </button>
                    </>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl">
                      Файл жоқ
                    </span>
                  )}

                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
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