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
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-950 text-white px-6 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">AUTHGUARD LOCKER</h1>
          <p className="text-slate-300 text-sm">Жаңа құжат қосу</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setPage("documents")}
            className="bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-xl"
          >
            Құжаттарым
          </button>

          <button
            onClick={() => setPage("dashboard")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
          >
            Dashboard
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
          >
            Шығу
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-semibold mb-2">Қолдау көрсетілетін файлдар</h3>
          <p className="text-slate-600">
            PDF, PNG, JPG, JPEG, DOC, DOCX, PPT, PPTX, TXT
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Құжат жүктеу формасы</h2>

            <form onSubmit={addDocument} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Құжат атауы</label>
                <input
                  className="w-full border rounded-xl p-3"
                  placeholder="Мысалы: Паспорт көшірмесі"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Категория</label>
                <input
                  className="w-full border rounded-xl p-3"
                  placeholder="Мысалы: Жеке құжат"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Сипаттама</label>
                <textarea
                  className="w-full border rounded-xl p-3 min-h-[130px]"
                  placeholder="Қысқаша түсініктеме"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Файл таңдау</label>

                <label
                  onDrop={handleDrop}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  className={`block w-full rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                    dragActive
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={(e) => onFileChange(e.target.files[0])}
                  />

                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-800">
                      Файлды осы жерге тастаңыз
                    </p>
                    <p className="text-sm text-slate-500">
                      немесе басып файл таңдаңыз
                    </p>
                    <p className="text-xs text-slate-400">
                      PDF, PNG, JPG, DOC, DOCX, PPT, PPTX, TXT
                    </p>
                  </div>
                </label>

                {file && (
                  <div className="mt-3 bg-slate-50 border rounded-2xl p-4">
                    <p className="font-medium text-slate-800 break-all">{file.name}</p>
                    <p className="text-sm text-slate-500">{getFileTypeLabel()}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>

              {message && (
                <div className="bg-slate-100 border rounded-xl p-4 text-slate-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium"
              >
                Құжат жүктеу
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Алдын ала қарау</h2>

            {!file ? (
              <div className="h-[420px] rounded-3xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500">
                Файл таңдалғаннан кейін preview осы жерде көрінеді
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500 mb-1">Файл атауы</p>
                  <p className="font-semibold text-slate-900 break-all">{file.name}</p>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <p className="text-sm text-slate-500 mb-1">Түрі</p>
                  <p className="font-semibold text-slate-900">
                    {getFileTypeLabel()}
                  </p>
                </div>

                {previewUrl ? (
                  <div className="rounded-3xl overflow-hidden border bg-slate-50 p-3">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-[260px] object-contain rounded-2xl bg-white"
                    />
                  </div>
                ) : (
                  <div className="h-[260px] rounded-3xl border bg-slate-50 flex items-center justify-center text-center text-slate-500 p-6">
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