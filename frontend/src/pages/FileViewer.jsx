import React from "react";
import { uploadBaseUrl } from "../services/apiConfig";

export default function FileViewer({ file }) {
  if (!file) return null;

  const baseUrl = uploadBaseUrl;

  const encodedFileName = encodeURIComponent(file.filename);
  const url = `${baseUrl}/uploads/${encodedFileName}`;
  const ext = file.filename.split(".").pop().toLowerCase();

  const officePreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    url
  )}`;

  const wrapperClass =
    "rounded-[32px] border border-sky-100 bg-white/95 p-4 sm:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur";
  const frameClass =
    "w-full rounded-[26px] border border-sky-100 bg-white shadow-sm";
  const infoBoxClass =
    "flex min-h-[500px] flex-col items-center justify-center rounded-[28px] border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-8 text-center";

  const Header = ({ title, subtitle, badge }) => (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">
          📄
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
      </div>

      <span className="inline-flex w-fit rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
        {badge}
      </span>
    </div>
  );

  if (ext === "pdf") {
    return (
      <div className={wrapperClass}>
        <Header
          title="PDF Preview"
          subtitle="Құжат браузер ішінде ашылды"
          badge="PDF"
        />

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
        <Header
          title="Image Preview"
          subtitle="Сурет браузер ішінде көрсетілді"
          badge="IMAGE"
        />

        <div className="flex min-h-[650px] items-center justify-center rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-4 sm:p-6">
          <img
            src={url}
            alt="preview"
            className="max-h-[800px] w-auto rounded-[24px] bg-white object-contain shadow-sm"
          />
        </div>
      </div>
    );
  }

  if (ext === "txt") {
    return (
      <div className={wrapperClass}>
        <Header
          title="Text Preview"
          subtitle="Мәтіндік файл браузер ішінде ашылды"
          badge="TXT"
        />

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
        <Header
          title="Office Preview"
          subtitle="Word, Excel, PowerPoint файлдары Office Viewer арқылы ашылады"
          badge="OFFICE"
        />

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
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-sm ring-1 ring-sky-100">
          📁
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-800">
          Бұл файл түріне preview қолдау көрсетілмейді
        </h3>

        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
          Файлды көру үшін оны жүктеп ашуға болады. Қауіпсіз жүктеу батырмасы
          төменде орналасқан.
        </p>

        <a
          href={url}
          download
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Файлды жүктеу
        </a>
      </div>
    </div>
  );
}
