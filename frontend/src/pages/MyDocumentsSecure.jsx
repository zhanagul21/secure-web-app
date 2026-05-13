import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function getFileTypeLabel(mimeType, name) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType?.startsWith("image/")) return "IMAGE";
  if (mimeType === "application/msword") return "DOC";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
  if (mimeType === "application/vnd.ms-powerpoint") return "PPT";
  if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "PPTX";
  if (mimeType === "text/plain") return "TXT";
  return name ? "FILE" : "NONE";
}

function getFileAccent(mimeType) {
  if (mimeType === "application/pdf") return "from-rose-400 to-orange-300";
  if (mimeType?.startsWith("image/")) return "from-emerald-400 to-teal-300";
  if (mimeType?.includes("presentation")) return "from-amber-400 to-orange-300";
  if (mimeType?.includes("word")) return "from-sky-500 to-blue-400";
  return "from-slate-500 to-slate-400";
}

function matchesType(doc, typeFilter) {
  if (typeFilter === "all") return true;
  if (typeFilter === "pdf") return doc.mime_type === "application/pdf";
  if (typeFilter === "images") return doc.mime_type?.startsWith("image/");
  if (typeFilter === "docs") {
    return (
      doc.mime_type === "application/msword" ||
      doc.mime_type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  }
  if (typeFilter === "slides") {
    return (
      doc.mime_type === "application/vnd.ms-powerpoint" ||
      doc.mime_type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
  }
  return true;
}

function MyDocumentsSecure({ setPage, setLoggedIn, setSelectedDocumentId }) {
  const [documents, setDocuments] = useState([]);
  const [trashDocuments, setTrashDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [trashMode, setTrashMode] = useState(false);
  const [limits, setLimits] = useState(null);

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
      const nextDocuments = res.data.documents || [];
      setDocuments(nextDocuments);
      setSelectedId((current) => current || nextDocuments[0]?.id || null);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Құжаттарды жүктеу кезінде қате шықты."
      );
    }
  };

  const getTrashDocuments = async () => {
    try {
      const res = await API.get("/documents/trash");
      const nextDocuments = res.data.documents || [];
      setTrashDocuments(nextDocuments);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Корзинаны жүктеу кезінде қате шықты."
      );
    }
  };

  useEffect(() => {
    getDocuments();
    getTrashDocuments();
    API.get("/documents/limits")
      .then((res) => setLimits(res.data))
      .catch(() => setLimits(null));
  }, []);

  const deleteDoc = async (id) => {
    if (!window.confirm("Осы құжатты өшіргіңіз келе ме?")) return;

    try {
      await API.delete(`/documents/delete/${id}`);
      setDocuments((current) => {
        const nextDocuments = current.filter((doc) => doc.id !== id);
        setSelectedId((selected) =>
          selected === id ? nextDocuments[0]?.id || null : selected
        );
        return nextDocuments;
      });
      setMessage("Құжат өшірілді.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Құжатты өшіру кезінде қате шықты."
      );
    }
  };

  const restoreDoc = async (id) => {
    try {
      await API.patch(`/documents/restore/${id}`);
      await getDocuments();
      await getTrashDocuments();
      setTrashMode(false);
      setMessage("Құжат қалпына келтірілді.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Қалпына келтіру кезінде қате шықты.");
    }
  };

  const permanentDeleteDoc = async (id) => {
    if (!window.confirm("Құжатты біржола өшіресіз бе? Бұл әрекет қайтарылмайды.")) return;

    try {
      await API.delete(`/documents/permanent/${id}`);
      setTrashDocuments((current) => {
        const nextDocuments = current.filter((doc) => doc.id !== id);
        setSelectedId((selected) =>
          selected === id ? nextDocuments[0]?.id || null : selected
        );
        return nextDocuments;
      });
      setMessage("Құжат біржола өшірілді.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Біржола өшіру кезінде қате шықты.");
    }
  };

  const downloadDoc = async (id, fileName) => {
    try {
      const response = await API.get(`/documents/download/${id}`, {
        responseType: "blob",
      });
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Құжатты жүктеу кезінде қате шықты."
      );
    }
  };

  const categories = useMemo(
    () =>
      [
        ...new Set(
          (trashMode ? trashDocuments : documents)
            .map((doc) => doc.category)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [documents, trashDocuments, trashMode]
  );

  const filteredDocuments = useMemo(() => {
    const searchText = search.toLowerCase();
    const sourceDocuments = trashMode ? trashDocuments : documents;

    return sourceDocuments.filter((doc) => {
      const matchesSearch =
        doc.title?.toLowerCase().includes(searchText) ||
        doc.description?.toLowerCase().includes(searchText) ||
        doc.category?.toLowerCase().includes(searchText) ||
        doc.original_name?.toLowerCase().includes(searchText);
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;
      return matchesSearch && matchesCategory && matchesType(doc, typeFilter);
    });
  }, [documents, trashDocuments, trashMode, search, categoryFilter, typeFilter]);

  useEffect(() => {
    if (!filteredDocuments.some((doc) => doc.id === selectedId)) {
      setSelectedId(filteredDocuments[0]?.id || null);
    }
  }, [filteredDocuments, selectedId]);

  const selectedDocument =
    filteredDocuments.find((doc) => doc.id === selectedId) ||
    filteredDocuments[0] ||
    null;

  const stats = useMemo(() => {
    const totalSize = documents.reduce(
      (sum, doc) => sum + Number(doc.file_size || 0),
      0
    );
    const pdfCount = documents.filter(
      (doc) => doc.mime_type === "application/pdf"
    ).length;
    const imageCount = documents.filter((doc) =>
      doc.mime_type?.startsWith("image/")
    ).length;

    return {
      total: documents.length,
      totalSize,
      pdfCount,
      imageCount,
    };
  }, [documents]);

  const typeFilters = [
    { id: "all", label: "Барлығы" },
    { id: "pdf", label: "PDF" },
    { id: "images", label: "Суреттер" },
    { id: "docs", label: "Құжаттар" },
    { id: "slides", label: "Презентациялар" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fbff_38%,#c7e3ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Қорғалған құжаттар хабы
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Файлдар серверде шифрланған күйде сақталады. Мұнда оларды
                іздеп, топтап, қауіпсіз preview және download жасай аласыз.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Басты бет
              </button>
              <button
                onClick={() => setPage("addDocument")}
                className="rounded-2xl bg-sky-600 px-4 py-2.5 font-semibold text-white transition hover:bg-sky-700"
              >
                Жаңа құжат
              </button>
              <button
                onClick={() => {
                  setTrashMode((current) => !current);
                  setSelectedId(null);
                }}
                className={`rounded-2xl px-4 py-2.5 font-semibold transition ${
                  trashMode
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                Корзина ({trashDocuments.length})
              </button>
              <button
                onClick={logout}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Барлық файл</p>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Жалпы көлем</p>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {formatFileSize(stats.totalSize)}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/95 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">PDF саны</p>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats.pdfCount}
            </p>
          </div>
          <div className="rounded-[28px] border border-sky-200 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Шифрлау</p>
            <p className="mt-3 text-2xl font-black text-slate-900">
              AES қорғалған
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Preview және download кезінде ғана дешифрланады
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-sky-100 bg-white/95 px-5 py-4 text-sm text-slate-700 shadow-sm">
          Бір файлға нақты limit:{" "}
          <span className="font-bold text-slate-900">
            {limits?.maxUploadSizeMb || 100} MB
          </span>
          . Қазіргі Render PostgreSQL storage:{" "}
          <span className="font-bold text-slate-900">
            {limits?.storage?.renderPostgresStorageLimitGb || 1} GB
          </span>
          . Үлкен файл керек болса `MAX_UPLOAD_SIZE_MB` және database plan көтеру керек.
        </div>

        <div className="mt-6 rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1.5fr_0.7fr]">
            <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Атауы, категориясы немесе файл аты бойынша іздеу"
                className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
              />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
              >
                <option value="all">Барлық категория</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setTypeFilter(filter.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      typeFilter === filter.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex rounded-2xl border border-slate-200 bg-white p-1">
                {[
                  { id: "grid", label: "Grid" },
                  { id: "list", label: "List" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      viewMode === mode.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-sky-100 bg-white/95 px-4 py-4 text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            {filteredDocuments.length === 0 ? (
              <div className="rounded-[32px] border border-white/70 bg-white/95 p-12 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">
                  Құжат табылмады
                </h2>
                <p className="mt-3 text-slate-600">
                  Фильтрлерді өзгертіп көріңіз немесе жаңа қорғалған құжат
                  жүктеңіз.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedId(doc.id)}
                    className={`rounded-[30px] border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
                      selectedDocument?.id === doc.id
                        ? "border-sky-300 bg-sky-50/80"
                        : "border-white/70 bg-white/95"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${getFileAccent(
                          doc.mime_type
                        )} text-sm font-black text-white shadow-sm`}
                      >
                        {getFileTypeLabel(doc.mime_type, doc.original_name)}
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {formatFileSize(Number(doc.file_size || 0))}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900">
                      {doc.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-sky-700">
                      {doc.category || "Категория жоқ"}
                    </p>
                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-600">
                      {doc.description || "Сипаттама берілмеген."}
                    </p>
                    <p className="mt-4 break-all text-sm text-slate-500">
                      {doc.original_name || "Файл атауы жоқ"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-sm">
                <div className="grid grid-cols-[1.5fr_0.9fr_0.65fr_0.7fr] gap-4 border-b border-slate-100 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <div>Файл</div>
                  <div>Категория</div>
                  <div>Көлем</div>
                  <div>Уақыты</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedId(doc.id)}
                      className={`grid w-full grid-cols-[1.5fr_0.9fr_0.65fr_0.7fr] gap-4 px-5 py-4 text-left transition ${
                        selectedDocument?.id === doc.id
                          ? "bg-sky-50"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {doc.title}
                        </div>
                        <div className="mt-1 break-all text-sm text-slate-500">
                          {doc.original_name || "Файл жоқ"}
                        </div>
                      </div>
                      <div className="text-sm text-slate-700">
                        {doc.category || "-"}
                      </div>
                      <div className="text-sm text-slate-700">
                        {formatFileSize(Number(doc.file_size || 0))}
                      </div>
                      <div className="text-sm text-slate-700">
                        {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString("kk-KZ")
                          : "-"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-sm">
            {selectedDocument ? (
              <>
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br ${getFileAccent(
                    selectedDocument.mime_type
                  )} text-lg font-black text-white shadow-sm`}
                >
                  {getFileTypeLabel(
                    selectedDocument.mime_type,
                    selectedDocument.original_name
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  {selectedDocument.title}
                </h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
                  {selectedDocument.category || "Категория жоқ"}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {selectedDocument.description ||
                    "Бұл құжатқа сипаттама толтырылмаған."}
                </p>

                <div className="mt-6 space-y-3 rounded-[26px] border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Файл атауы</span>
                    <span className="max-w-[220px] break-all text-right font-semibold text-slate-900">
                      {selectedDocument.original_name || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Көлем</span>
                    <span className="font-semibold text-slate-900">
                      {formatFileSize(Number(selectedDocument.file_size || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Жүктелген күні</span>
                    <span className="font-semibold text-slate-900">
                      {selectedDocument.created_at
                        ? new Date(selectedDocument.created_at).toLocaleString(
                            "kk-KZ"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-[26px] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">
                    Қауіпсіздік статусы
                  </p>
                  <p className="mt-3 text-sm leading-6 text-emerald-900">
                    Бұл құжат серверде шифрланған күйде сақталады. Ашу және
                    жүктеу кезінде ғана уақытша дешифрланады.
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  {trashMode && (
                    <>
                      <button
                        onClick={() => restoreDoc(selectedDocument.id)}
                        className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Қалпына келтіру
                      </button>
                      <button
                        onClick={() => permanentDeleteDoc(selectedDocument.id)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Біржола өшіру
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDocumentId(selectedDocument.id);
                      setPage("viewer");
                    }}
                    className={`${trashMode ? "hidden " : ""}rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800`}
                  >
                    Қауіпсіз preview ашу
                  </button>
                  <button
                    onClick={() =>
                      downloadDoc(
                        selectedDocument.id,
                        selectedDocument.original_name
                      )
                    }
                    className={`${trashMode ? "hidden " : ""}rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50`}
                  >
                    Дешифрлап жүктеу
                  </button>
                  <button
                    onClick={() => deleteDoc(selectedDocument.id)}
                    className={`${trashMode ? "hidden " : ""}rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-100`}
                  >
                    Құжатты өшіру
                  </button>
                </div>
              </>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Тізімнен құжат таңдаңыз.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyDocumentsSecure;
