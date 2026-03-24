import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AddDocument({ setPage, setLoggedIn }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    setLoggedIn(false);
  };

  const previewUrl = useMemo(() => {
    if (!file) return null;
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getFileTypeLabel = () => {
    if (!file) return "Файл таңдалмаған";
    if (file.type === "application/pdf") return "PDF құжаты";
    if (file.type.startsWith("image/")) return "Сурет";

    if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "Word құжаты";
    }

    if (
      file.type === "application/vnd.ms-powerpoint" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "PowerPoint презентациясы";
    }

    if (file.type === "text/plain") return "TXT мәтіндік файл";

    return "Құжат";
  };

  const onFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    if (!title) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(cleanName);
    }
  };

  const addDocument = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title || !category || !file) {
      setMessage("Құжат атауы, категория және файл міндетті");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("file", file);

      const res = await API.post("/documents/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Құжат сәтті жүктелді");

      setTimeout(() => {
        setPage("documents");
      }, 700);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Құжат жүктеу кезінде қате шықты"
      );
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    onFileChange(droppedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-sky-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-3xl shadow-sm ring-1 ring-sky-200">
                ⬆️
              </div>

              <div>
                <p className="text-sm font-medium text-sky-700">
                  AuthGuard Locker
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                  Жаңа құжат қосу
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                  Құжатты жүктеу, сипаттама қосу және жүйеге сақтау бөлімі
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPage("documents")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Құжаттарым
              </button>

              <button
                onClick={() => setPage("dashboard")}
                className="rounded-2xl bg-slate-700 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800"
              >
                Dashboard
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-sky-200 bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">
              Құжат жүктеу формасы
            </h2>

            <form onSubmit={addDocument} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Құжат атауы
                </label>
                <input
                  className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                  placeholder="Мысалы: Паспорт көшірмесі"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Категория
                </label>
                <input
                  className="w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                  placeholder="Мысалы: Жеке құжат"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Сипаттама
                </label>
                <textarea
                  className="min-h-[130px] w-full rounded-2xl border border-sky-200 bg-sky-100 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
                  placeholder="Қысқаша түсініктеме"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Файл таңдау
                </label>

                <label
                  onDrop={handleDrop}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  className={`block w-full cursor-pointer rounded-[24px] border-2 border-dashed p-8 text-center transition ${
                    dragActive
                      ? "border-sky-400 bg-sky-200"
                      : "border-sky-200 bg-sky-100"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,png,jpg,jpeg,doc,docx,ppt,pptx,txt"
                    className="hidden"
                    onChange={(e) => onFileChange(e.target.files[0])}
                  />

                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-800">
                      Файлды осы жерге тастаңыз
                    </p>
                    <p className="text-sm text-slate-700">
                      немесе басып файл таңдаңыз
                    </p>
                    <p className="text-xs text-slate-600">
                      PDF, PNG, JPG, DOC, DOCX, PPT, PPTX, TXT
                    </p>
                  </div>
                </label>

                {file && (
                  <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-100 p-4">
                    <p className="break-all font-medium text-slate-800">
                      {file.name}
                    </p>
                    <p className="text-sm text-slate-700">
                      {getFileTypeLabel()}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>

              {message && (
                <div className="rounded-2xl border border-sky-200 bg-sky-100 p-4 text-slate-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Құжат жүктеу
              </button>
            </form>
          </div>

          <div className="rounded-[32px] border border-sky-200 bg-white/90 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800">
              Алдын ала қарау
            </h2>

            {!file ? (
              <div className="mt-6 flex h-[420px] items-center justify-center rounded-[28px] border border-dashed border-sky-200 bg-sky-100 text-center text-slate-700">
                Файл таңдалғаннан кейін preview осы жерде көрінеді
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-sky-200 bg-sky-100 p-5">
                  <p className="mb-1 text-sm text-slate-600">Файл атауы</p>
                  <p className="break-all font-semibold text-slate-900">
                    {file.name}
                  </p>
                </div>

                <div className="rounded-[24px] border border-sky-200 bg-sky-100 p-5">
                  <p className="mb-1 text-sm text-slate-600">Түрі</p>
                  <p className="font-semibold text-slate-900">
                    {getFileTypeLabel()}
                  </p>
                </div>

                {previewUrl ? (
                  <div className="overflow-hidden rounded-[24px] border border-sky-200 bg-sky-100 p-3">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="h-[260px] w-full rounded-2xl bg-white object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-sky-200 bg-sky-100 p-6 text-center text-slate-700">
                    Бұл файл түріне визуалды preview жоқ, бірақ жүктеуге дайын.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDocument;