import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../services/apiConfig";

const categorySuggestions = [
  "Жеке құжат",
  "Келісімшарт",
  "Есеп",
  "Excel",
  "Презентация",
  "Сертификат",
  "Фото архив",
];

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function AddDocumentSecure({ setPage, setLoggedIn, logoutEverywhere }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [folderName, setFolderName] = useState("");
  const [saveAsFolder, setSaveAsFolder] = useState(false);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const previewUrl = useMemo(() => {
    const firstFile = files.find((item) => item.type.startsWith("image/") || item.type.startsWith("video/"));
    if (!firstFile) return null;
    return URL.createObjectURL(firstFile);
  }, [files]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setFolderName("");
    setSaveAsFolder(false);
    setDescription("");
    setFiles([]);
    setUploadProgress(0);
  };

  const onFileChange = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles || []);
    if (!nextFiles.length) return;
    setFiles((current) => {
      const merged = [...current, ...nextFiles];
      if (!title && merged[0]) setTitle(merged[0].name.replace(/\.[^/.]+$/, ""));
      if (!folderName && merged.length > 1) {
        setFolderName(title || "Жаңа папка");
        setSaveAsFolder(true);
      }
      return merged;
    });
    setMessage("");
  };

  const addDocument = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || !category.trim() || files.length === 0) {
      setMessage("Құжат атауы, категория және кемінде бір файл міндетті.");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category.trim());
      formData.append("description", description.trim());
      if (saveAsFolder || files.length > 1) {
        formData.append("folderName", (folderName || title).trim());
      }
      files.forEach((item) => formData.append("files", item));

      const res = await API.post("/documents/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          setUploadProgress(
            Math.min(
              100,
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            )
          );
        },
      });

      setMessage(
        res.data.message ||
          "Файл сақталды."
      );
      resetForm();
      setTimeout(() => setPage("documents"), 700);
    } catch (error) {
      console.error("DOCUMENT UPLOAD ERROR:", error);
      setMessage(getApiErrorMessage(error, "Құжат жүктеу кезінде қате шықты."));
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    onFileChange(event.dataTransfer.files);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  };

  const firstFile = files[0] || null;
  const totalSize = files.reduce((sum, item) => sum + item.size, 0);
  const fileTypeLabel = firstFile?.type
    ? files.length > 1
      ? `${files.length} файл`
      : firstFile.type.startsWith("image/")
      ? "Сурет"
      : firstFile.type.startsWith("video/")
      ? "Видео"
      : firstFile.type.startsWith("audio/")
      ? "Аудио"
      : firstFile.type === "application/pdf"
      ? "PDF"
      : firstFile.type.includes("word")
      ? "Құжат"
      : firstFile.type.includes("spreadsheet") || firstFile.type.includes("excel")
      ? "Кесте"
      : firstFile.type.includes("presentation")
      ? "Слайд"
      : "Файл"
    : "Файл жоқ";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#eff6ff_35%,#bfdbfe_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                AuthGuard Locker
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Файл жүктеу
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Файлды таңдаңыз да, атауы мен түрін көрсетіп сақтаңыз. Кейін оны
                қарап немесе жүктеп ала аласыз.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Құжаттар
              </button>
              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Басты бет
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={addDocument}
            className="rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Жүктеу формасы
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Файл туралы ақпаратты толтырып, сақтауға жіберіңіз.
                </p>
              </div>
              <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
                Бір немесе бірнеше файл таңдауға болады
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Құжат атауы
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Мысалы: Жеке куәлік көшірмесі"
                  className="w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Категория
                </label>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Мысалы: Жеке құжат"
                  className="w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {categorySuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-white p-4">
                <label className="flex items-start gap-3 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={saveAsFolder || files.length > 1}
                    onChange={(event) => setSaveAsFolder(event.target.checked)}
                    className="mt-1"
                  />
                  Бір папкаға жинау
                </label>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Мысалы, “Сабақтар” деп жазсаңыз, таңдалған бірнеше файл сол папка атауымен бірге сақталады.
                </p>
                {(saveAsFolder || files.length > 1) && (
                  <input
                    value={folderName}
                    onChange={(event) => setFolderName(event.target.value)}
                    placeholder="Мысалы: Сабақтар"
                    className="mt-3 w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Сипаттама
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Қысқаша түсініктеме"
                  className="min-h-[140px] w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-300"
                />
              </div>

              <label
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                className={`block cursor-pointer rounded-[28px] border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? "border-sky-400 bg-sky-100"
                    : "border-sky-200 bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => onFileChange(event.target.files)}
                />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm ring-1 ring-sky-100">
                  FILE
                </div>
                <p className="mt-4 text-lg font-bold text-slate-900">
                  Файлды осы жерге тастаңыз
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  немесе басып бірден бірнеше файл таңдаңыз
                </p>
              </label>

              {files.length > 0 && (
                <div className="rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                        Таңдалған файлдар
                      </p>
                      <p className="mt-2 break-all text-lg font-bold text-slate-900">
                        {files.length === 1 ? files[0].name : `${files.length} файл таңдалды`}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {fileTypeLabel} · {formatFileSize(totalSize)}
                      </p>
                      {files.length > 1 && (
                        <div className="mt-3 space-y-2">
                          {files.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                              <span className="min-w-0 truncate">{item.name}</span>
                              <span className="shrink-0 text-slate-500">{formatFileSize(item.size)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Барлығын алып тастау
                    </button>
                  </div>

                  {loading && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <span>Жүктелу барысы</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-sky-100">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a,#0284c7)] transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-sky-100 bg-white p-4 text-slate-700">
                  {message}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                >
                  {loading
                    ? `Жүктеліп жатыр... ${uploadProgress}%`
                    : "Файлды сақтау"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Тазалау
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">
                Файл қалай сақталады?
              </h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-800">Сақталған файлды тек иесі аша алады</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    Жүктегеннен кейін файл серверде оқылмайтын күйде сақталады. Оны тек өз аккаунтыңыздан ашып тексере аласыз.
                  </p>
                </div>
                <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5">
                  <p className="font-semibold text-sky-800">Бірнеше файлды бірге сақтау</p>
                  <p className="mt-2 text-sm leading-6 text-sky-900">
                    Бірнеше файл таңдасаңыз, олар бір папка атауымен тізімде бірге көрінеді.
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-800">Жүктеу көлемі</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Үлкен файл жүктелсе, барысы пайызбен көрсетіледі.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">
                Алдын ала көру
              </h2>
              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-100 bg-[linear-gradient(180deg,#f8fafc,#eef6ff)] p-5">
                {previewUrl && firstFile?.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt="Алдын ала көру"
                    className="h-[320px] w-full rounded-2xl bg-white object-contain"
                  />
                ) : previewUrl && firstFile?.type.startsWith("video/") ? (
                  <video
                    src={previewUrl}
                    controls
                    className="h-[320px] w-full rounded-2xl bg-slate-950 object-contain"
                  />
                ) : (
                  <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-white text-center text-slate-500">
                    Сурет немесе видео таңдасаңыз, осы жерде көрінеді. Басқа файлдар жай ғана сақталады.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDocumentSecure;
