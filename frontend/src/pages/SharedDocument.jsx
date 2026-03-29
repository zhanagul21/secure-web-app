import { useEffect, useState } from "react";

function SharedDocument({ token }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Ссылка табылмады");
      setLoading(false);
      return;
    }

    loadSharedDocument();
  }, [token]);

  const loadSharedDocument = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const url = `${apiBase}/documents/shared/${token}`;

      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setError(data.message || "Қате шықты");
        } catch {
          setError(text || "Қате шықты");
        }
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      window.location.href = fileUrl;
    } catch (err) {
      console.error("SHARED DOCUMENT ERROR:", err);
      setError("Серверге қосылу мүмкін болмады");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6">
      <div className="rounded-3xl bg-white px-8 py-10 text-center shadow">
        {loading ? (
          <h2 className="text-xl font-semibold text-slate-800">
            Құжат жүктелуде...
          </h2>
        ) : (
          <h2 className="text-xl font-bold text-red-600">{error}</h2>
        )}
      </div>
    </div>
  );
}

export default SharedDocument;