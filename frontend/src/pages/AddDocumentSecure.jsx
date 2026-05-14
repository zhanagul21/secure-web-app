import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const categorySuggestions = [
  "Жеке құжат",
  "Келісімшарт",
  "Есеп",
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
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith("image/")) return null;
    return URL.createObjectURL(file);
  }, [file]);

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
    setDescription("");
    setFile(null);
    setUploadProgress(0);
  };

  const onFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setMessage("");
  };

  const addDocument = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || !category.trim() || !file) {
      setMessage("Құжат атауы, категория және файл міндетті.");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category.trim());
      formData.append("description", description.trim());
      formData.append("file", file);

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
          "Құжат жүктелді және серверде шифрланды."
      );
      resetForm();
      setTimeout(() => setPage("documents"), 700);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Құжат жүктеу кезінде қате шықты."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    onFileChange(event.dataTransfer.files?.[0]);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  };

  const fileTypeLabel = file?.type
    ? file.type.startsWith("image/")
      ? "Image"
      : file.type === "application/pdf"
      ? "PDF"
      : file.type.includes("word")
      ? "Document"
      : file.type.includes("presentation")
      ? "Slides"
      : "File"
    : "No file";

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
                Қауіпсіз жүктеу аймағы
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Жүктелген файл серверде бірден шифрланады. Пайдаланушыға preview
                және download кезінде ғана қолжетімді болады.
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
                  Файл метадерегін толтырып, қауіпсіз сақтау аймағына жіберіңіз.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                AES-256-GCM storage encryption
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
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt"
                  className="hidden"
                  onChange={(event) => onFileChange(event.target.files?.[0])}
                />
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm ring-1 ring-sky-100">
                  FILE
                </div>
                <p className="mt-4 text-lg font-bold text-slate-900">
                  Файлды осы жерге тастаңыз
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  немесе басып файл таңдаңыз
                </p>
              </label>

              {file && (
                <div className="rounded-[26px] border border-sky-100 bg-sky-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                        Selected file
                      </p>
                      <p className="mt-2 break-all text-lg font-bold text-slate-900">
                        {file.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {fileTypeLabel} · {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Алып тастау
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
                    : "Құжатты шифрлап жүктеу"}
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
                Қауіпсіздік статусы
              </h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-800">Шифрлау</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    Файл серверде ашық түрде емес, шифрланған түрде сақталады.
                  </p>
                </div>
                <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5">
                  <p className="font-semibold text-sky-800">Дешифрлау</p>
                  <p className="mt-2 text-sm leading-6 text-sky-900">
                    Preview, download және shared link кезінде ғана уақытша
                    дешифрланады.
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-800">Upload limits</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Үлкен файлдар үшін progress indicator көрінеді, сондықтан
                    user жүктелу статусын жоғалтпайды.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900">
                Live preview
              </h2>
              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-100 bg-[linear-gradient(180deg,#f8fafc,#eef6ff)] p-5">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-[320px] w-full rounded-2xl bg-white object-contain"
                  />
                ) : (
                  <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-white text-center text-slate-500">
                    Сурет файлын таңдасаңыз, preview осы жерде көрінеді.
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
