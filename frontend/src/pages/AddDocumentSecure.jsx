import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AddDocumentSecure({ setPage, setLoggedIn }) {
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const onFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
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

      setMessage(res.data.message || "Құжат жүктелді және серверде шифрланды.");
      setTimeout(() => setPage("documents"), 700);
    } catch (error) {
      setMessage(error.response?.data?.message || "Құжат жүктеу кезінде қате шықты.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                Қауіпсіз құжат жүктеу
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
                Файл серверде шифрланған күйде сақталады, ал ашу мен жүктеу кезінде ғана уақытша дешифрланады.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("documents")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Құжаттарым</button>
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={logout} className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form onSubmit={addDocument} className="rounded-[32px] border border-sky-200 bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">Құжат жүктеу формасы</h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Құжат атауы</label>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Мысалы: Паспорт көшірмесі" className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Категория</label>
                <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Мысалы: Жеке құжат" className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Сипаттама</label>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Қысқаша түсініктеме" className="min-h-[130px] w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none focus:border-sky-400" />
              </div>

              <label onDrop={handleDrop} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} className={`block cursor-pointer rounded-[24px] border-2 border-dashed p-8 text-center transition ${dragActive ? "border-sky-400 bg-sky-200" : "border-sky-200 bg-sky-100"}`}>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt" className="hidden" onChange={(event) => onFileChange(event.target.files?.[0])} />
                <p className="text-lg font-semibold text-slate-800">Файлды осы жерге тастаңыз</p>
                <p className="mt-2 text-sm text-slate-700">немесе басып файл таңдаңыз</p>
              </label>

              {file && (
                <div className="rounded-2xl border border-sky-200 bg-sky-100 p-4">
                  <p className="break-all font-semibold text-slate-900">{file.name}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">Сақтау кезінде шифрланады</p>
                  {loading && (
                    <p className="mt-2 text-sm text-sky-700">
                      Жүктелу барысы: {uploadProgress}%
                    </p>
                  )}
                </div>
              )}

              {message && <div className="rounded-2xl border border-sky-200 bg-sky-100 p-4 text-slate-700">{message}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {loading
                  ? `Жүктеліп жатыр... ${uploadProgress}%`
                  : "Құжатты шифрлап жүктеу"}
              </button>
            </div>
          </form>

          <div className="rounded-[32px] border border-sky-200 bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">Қауіпсіздік статусы</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
                <p className="font-semibold text-emerald-800">Шифрлау</p>
                <p className="mt-2 text-sm text-emerald-900">Файл сервер дискісінде ашық күйде емес, шифрланған күйде сақталады.</p>
              </div>
              <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5">
                <p className="font-semibold text-sky-800">Дешифрлау</p>
                <p className="mt-2 text-sm text-sky-900">Preview, download және shared link кезінде файл автоматты дешифрланады.</p>
              </div>
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-[260px] w-full rounded-2xl bg-white object-contain" />
              ) : (
                <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-sky-200 bg-sky-100 p-6 text-center text-slate-700">
                  Сурет файлын таңдасаңыз, preview осы жерде көрінеді.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDocumentSecure;
