import { useEffect, useState } from "react";
import API from "../services/api";

function Documents() {
  const [docs, setDocs] = useState([]);

  const loadDocs = async () => {
    const token = localStorage.getItem("token");

    const res = await API.get("/documents", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDocs(res.data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Құжаттар</h1>

      <div className="grid grid-cols-3 gap-6">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition"
          >
            <h2 className="text-lg font-bold">{doc.title}</h2>

            <p className="text-gray-500">{doc.category}</p>

            <div className="mt-4 flex gap-2">
              <a
                href={`http://localhost:5000/api/documents/download/${doc.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Жүктеу
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Documents;