import React from "react";

export default function FileViewer({ file }) {

  if (!file) return null;

  const url = `http://localhost:5000/uploads/${file.filename}`;
  const ext = file.filename.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    return (
      <iframe
        src={url}
        width="100%"
        height="800px"
        title="PDF Viewer"
      />
    );
  }

  if (["jpg","jpeg","png","gif"].includes(ext)) {
    return (
      <img
        src={url}
        alt="preview"
        style={{ maxWidth:"100%", maxHeight:"800px" }}
      />
    );
  }

  if (ext === "txt") {
    return (
      <iframe
        src={url}
        width="100%"
        height="800px"
        title="Text Viewer"
      />
    );
  }

  if (["doc","docx","xls","xlsx","ppt","pptx"].includes(ext)) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${url}`}
        width="100%"
        height="800px"
        title="Office Viewer"
      />
    );
  }

  return (
    <div>
      Бұл файл preview қолдау көрсетілмейді
      <br />
      <a href={url} download>
        Файлды жүктеу
      </a>
    </div>
  );
}