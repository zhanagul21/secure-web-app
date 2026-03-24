import React from "react";

export default function FileViewer({ file }) {
  if (!file) return null;

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "http://localhost:5000";

  const encodedFileName = encodeURIComponent(file.filename);
  const url = `${baseUrl}/uploads/${encodedFileName}`;
  const ext = file.filename.split(".").pop().toLowerCase();

  const officePreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    url
  )}`;

  const wrapperClass =
    "rounded-[28px] border border-sky-100 bg-white p-4 shadow-sm";
  const frameClass =
    "w-full rounded-[24px] border border-sky-100 bg-white";
  const infoBoxClass =
    "flex min-h-[500px] flex-col items-center justify-center rounded-[24px] border border-dashed border-sky-100 bg-sky-50 p-8 text-center";

  if (ext === "pdf") {
    return (
      <div className={wrapperClass}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">PDF Preview</h2>
            <p className="text-sm text-slate-500">
              Құжат браузер ішінде ашылды
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
            PDF
          </span>
        </div>

        <iframe
          src={url}
          width="100%"
          height="850px"
          title="PDF Viewer"
          className={frameClass}
        />
      </div>
    );
  }

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return (
      <div className={wrapperClass}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Image Preview</h2>
            <p className="text-sm text-slate-500">
              Сурет браузер ішінде көрсетілді
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
            IMAGE
          </span>
        </div>

        <div className="flex min-h-[650px] items-center justify-center rounded-[24px] border border-sky-100 bg-sky-50 p-4">
          <img
            src={url}
            alt="preview"
            className="max-h-[800px] w-auto rounded-[20px] bg-white object-contain"
          />
        </div>
      </div>
    );
  }

  if (ext === "txt") {
    return (
      <div className={wrapperClass}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Text Preview</h2>
            <p className="text-sm text-slate-500">
              Мәтіндік файл браузер ішінде ашылды
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
            TXT
          </span>
        </div>

        <iframe
          src={url}
          width="100%"
          height="850px"
          title="Text Viewer"
          className={frameClass}
        />
      </div>
    );
  }

  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    return (
      <div className={wrapperClass}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Office Preview</h2>
            <p className="text-sm text-slate-500">
              Word, Excel, PowerPoint файлдары Office Viewer арқылы ашылады
            </p>
          </div>
          <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
            OFFICE
          </span>
        </div>

        <iframe
          src={officePreviewUrl}
          width="100%"
          height="850px"
          title="Office Viewer"
          className={frameClass}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className={infoBoxClass}>
        <div className="text-5xl">📁</div>
        <h3 className="mt-4 text-xl font-bold text-slate-800">
          Бұл файл түріне preview қолдау көрсетілмейді
        </h3>
        <p className="mt-2 max-w-md text-slate-600">
          Файлды көру үшін оны жүктеп ашуға болады.
        </p>

        <a
          href={url}
          download
          className="mt-5 rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Файлды жүктеу
        </a>
      </div>
    </div>
  );
}