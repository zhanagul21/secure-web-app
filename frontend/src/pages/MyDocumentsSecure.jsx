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
  if (mimeType === "application/vnd.ms-excel") return "XLS";
  if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "XLSX";
  if (mimeType === "application/vnd.ms-powerpoint") return "PPT";
  if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") return "PPTX";
  if (mimeType === "text/plain") return "TXT";
  return name ? "FILE" : "NONE";
}

function getFileAccent(mimeType) {
  if (mimeType === "application/pdf") return "from-rose-400 to-orange-300";
  if (mimeType?.startsWith("image/")) return "from-emerald-400 to-teal-300";
  if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) return "from-emerald-500 to-lime-300";
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

function MyDocumentsSecure({ setPage, setLoggedIn, setSelectedDocumentId, logoutEverywhere }) {
  const [documents, setDocuments] = useState([]);
  const [receivedDocuments, setReceivedDocuments] = useState([]);
  const [trashDocuments, setTrashDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [trashMode, setTrashMode] = useState(false);
  const [encryptionCheck, setEncryptionCheck] = useState("");
  const [mailboxMode, setMailboxMode] = useState("mine");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendNote, setSendNote] = useState("");

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
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

  const getReceivedDocuments = async () => {
    try {
      const res = await API.get("/documents/received");
      setReceivedDocuments(res.data.documents || []);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Келген құжаттарды жүктеу кезінде қате шықты.");
    }
  };

  useEffect(() => {
    getDocuments();
    getTrashDocuments();
    getReceivedDocuments();
  }, []);

  const deleteDoc = async (id) => {
    if (!window.confirm("Осы құжатты өшіргіңіз келе ме?")) return;

    try {
      await API.delete(`/documents/delete/${id}`);
      setSelectedId((selected) => (selected === id ? null : selected));
      await Promise.all([getDocuments(), getTrashDocuments()]);
      setMessage("Құжат корзинаға жіберілді.");
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

  const checkEncryption = async (id) => {
    try {
      const res = await API.get(`/documents/encryption-proof/${id}`);
      setEncryptionCheck(
        res.data.encrypted
          ? "Бұл файл серверде шифрланған күйде сақтаулы. Бұл тек өз құжатыңыз болғандықтан көрсетілді."
          : "Бұл файл шифрланған күйде сақталмаған сияқты. Қайта жүктеп көріңіз."
      );
    } catch (error) {
      setEncryptionCheck(error.response?.data?.message || "Тексеру кезінде қате шықты.");
    }
  };

  const sendDocument = async () => {
    if (!selectedDocument || selectedDocument.is_received) return;
    if (!recipientEmail.trim()) {
      setMessage("Құжат жіберу үшін алушының email-ін жазыңыз.");
      return;
    }

    try {
      const res = await API.post(`/documents/send/${selectedDocument.id}`, {
        recipientEmail: recipientEmail.trim(),
        note: sendNote.trim(),
      });
      setMessage(res.data.message || "Құжат жіберілді.");
      setRecipientEmail("");
      setSendNote("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Құжат жіберу кезінде қате шықты.");
    }
  };

  const categories = useMemo(
    () =>
      [
        ...new Set(
          (trashMode ? trashDocuments : mailboxMode === "received" ? receivedDocuments : documents)
            .map((doc) => doc.category)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [documents, receivedDocuments, trashDocuments, trashMode, mailboxMode]
  );

  const filteredDocuments = useMemo(() => {
    const searchText = search.toLowerCase();
    const sourceDocuments = trashMode
      ? trashDocuments
      : mailboxMode === "received"
      ? receivedDocuments.map((doc) => ({ ...doc, is_received: true }))
      : documents;

    return sourceDocuments.filter((doc) => {
      const matchesSearch =
        doc.title?.toLowerCase().includes(searchText) ||
        doc.description?.toLowerCase().includes(searchText) ||
        doc.category?.toLowerCase().includes(searchText) ||
        doc.folder_name?.toLowerCase().includes(searchText) ||
        doc.original_name?.toLowerCase().includes(searchText);
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;
      return matchesSearch && matchesCategory && matchesType(doc, typeFilter);
    });
  }, [documents, receivedDocuments, trashDocuments, trashMode, mailboxMode, search, categoryFilter, typeFilter]);

  const folderGroups = useMemo(() => {
    const groups = new Map();
    documents.forEach((doc) => {
      if (!doc.folder_name) return;
      const current = groups.get(doc.folder_name) || { name: doc.folder_name, count: 0, size: 0 };
      current.count += 1;
      current.size += Number(doc.file_size || 0);
      groups.set(doc.folder_name, current);
    });
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [documents]);

  useEffect(() => {
    if (!filteredDocuments.some((doc) => doc.id === selectedId)) {
      setSelectedId(filteredDocuments[0]?.id || null);
    }
  }, [filteredDocuments, selectedId]);

  const selectedDocument =
    filteredDocuments.find((doc) => doc.id === selectedId) ||
    filteredDocuments[0] ||
    null;

  useEffect(() => {
    setEncryptionCheck("");
  }, [selectedDocument?.id]);

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
    const folderCount = new Set(documents.map((doc) => doc.folder_name).filter(Boolean)).size;

    return {
      total: documents.length,
      totalSize,
      pdfCount,
      imageCount,
      folderCount,
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
                {mailboxMode === "received" ? "Маған келген құжаттар" : "Менің құжаттарым"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                {mailboxMode === "received"
                  ? "Басқа қолданушылар сізге жіберген құжаттар осы жерде көрінеді."
                  : "Мұнда сақталған файлдарыңызды көріп, іздеп, жүктей аласыз."}
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
                  setMailboxMode((current) => (current === "mine" ? "received" : "mine"));
                  setTrashMode(false);
                  setSelectedId(null);
                }}
                className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2.5 font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                {mailboxMode === "received" ? "Өз құжаттарым" : `Маған келген (${receivedDocuments.length})`}
              </button>
              <button
                onClick={() => {
                  setTrashMode((current) => !current);
                  setMailboxMode("mine");
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
            <p className="text-sm font-medium text-slate-500">Папкалар</p>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {stats.folderCount}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Бірге сақталған файл топтары
            </p>
          </div>
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
                  { id: "grid", label: "Тор" },
                  { id: "list", label: "Тізім" },
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

        {!trashMode && mailboxMode === "mine" && folderGroups.length > 0 && (
          <div className="mt-6 rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-900">Папкалар</h2>
              <span className="text-sm text-slate-500">Папканы бассаңыз, ішіндегі файлдар шығады</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {folderGroups.map((folder) => (
                <button
                  key={folder.name}
                  type="button"
                  onClick={() => setSearch(folder.name)}
                  className="rounded-[22px] border border-sky-100 bg-sky-50 p-4 text-left transition hover:border-sky-300 hover:bg-sky-100"
                >
                  <div className="font-bold text-slate-900">{folder.name}</div>
                  <div className="mt-2 text-sm text-slate-600">
                    {folder.count} файл · {formatFileSize(folder.size)}
                  </div>
                </button>
              ))}
            </div>
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
                  Іздеу шартын өзгертіп көріңіз немесе жаңа файл жүктеңіз.
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
                    {doc.folder_name && (
                      <p className="mt-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                        Папка: {doc.folder_name}
                      </p>
                    )}
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
                      {doc.folder_name && (
                        <div className="mt-1 text-xs font-semibold text-sky-700">
                          Папка: {doc.folder_name}
                        </div>
                      )}
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
                {selectedDocument.folder_name && (
                  <p className="mt-3 inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                    Папка: {selectedDocument.folder_name}
                  </p>
                )}
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {selectedDocument.description ||
                    "Бұл құжатқа сипаттама толтырылмаған."}
                </p>
                {selectedDocument.is_received && (
                  <div className="mt-4 rounded-[22px] border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-sky-800">Сізге жіберілген құжат</div>
                    <div className="mt-2">
                      Жіберген: {selectedDocument.sender_name || selectedDocument.sender_email || "-"}
                    </div>
                    {selectedDocument.note && (
                      <div className="mt-2">Хабарлама: {selectedDocument.note}</div>
                    )}
                  </div>
                )}

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
                    Сақталуын тексеру
                  </p>
                  <p className="mt-3 text-sm leading-6 text-emerald-900">
                    Бұл тексеру өзіңіз жүктеген немесе сізге жіберілген құжатқа ғана ашылады.
                  </p>
                  {encryptionCheck && (
                    <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100">
                      {encryptionCheck}
                    </div>
                  )}
                </div>

                {!selectedDocument.is_received && !trashMode && (
                  <div className="mt-6 rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-800">
                      Басқа қолданушыға жіберу
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Құжатты тек жүйеде тіркелген email-ге жібере аласыз. Алушы оны өз аккаунтынан ашады.
                    </p>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(event) => setRecipientEmail(event.target.value)}
                      placeholder="Алушының email-і"
                      className="mt-4 w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none"
                    />
                    <textarea
                      value={sendNote}
                      onChange={(event) => setSendNote(event.target.value)}
                      placeholder="Қысқа хабарлама (міндетті емес)"
                      className="mt-3 min-h-[90px] w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none"
                    />
                    <button
                      onClick={sendDocument}
                      className="mt-3 rounded-2xl bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800"
                    >
                      Құжатты жіберу
                    </button>
                  </div>
                )}

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
                    Ашу
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
                    Жүктеп алу
                  </button>
                  <button
                    onClick={() => checkEncryption(selectedDocument.id)}
                    className={`${trashMode ? "hidden " : ""}rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100`}
                  >
                    Сақталуын тексеру
                  </button>
                  <button
                    onClick={() => deleteDoc(selectedDocument.id)}
                    className={`${trashMode || selectedDocument.is_received ? "hidden " : ""}rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-100`}
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
