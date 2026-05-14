import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

function Profile({ setLoggedIn, setPage, logoutEverywhere }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [saving, setSaving] = useState(false);

  const logout = () => {
    if (logoutEverywhere) {
      logoutEverywhere();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tempUserEmail");
    localStorage.removeItem("tempUserRole");
    localStorage.removeItem("tempUserId");
    localStorage.removeItem("temp2faToken");
    setLoggedIn(false);
    setPage("login");
  };

  const getProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      const nextUser = res.data.user;
      setUser(nextUser);
      setFullName(nextUser?.full_name || "");
      setAvatarUrl(nextUser?.avatar_url || "");
    } catch {
      setMessage("Профиль жүктеу қатесі");
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const initials = useMemo(() => {
    const source = (fullName || user?.full_name || user?.email || "AU").trim();
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "AU";
  }, [fullName, user]);

  const resizeAvatar = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      const image = new Image();

      reader.onerror = () => reject(new Error("Суретті оқу мүмкін болмады"));
      image.onerror = () => reject(new Error("Сурет форматы дұрыс емес"));

      image.onload = () => {
        const maxSize = 512;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      reader.onload = () => {
        image.src = reader.result?.toString() || "";
      };
      reader.readAsDataURL(file);
    });

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Тек сурет файлын таңдаңыз");
      return;
    }

    try {
      setMessage("");
      const resizedAvatar = await resizeAvatar(file);
      setAvatarUrl(resizedAvatar);
      setAvatarFileName(file.name);
      setMessage("Сурет дайын. Сақтау батырмасын басыңыз.");
    } catch (error) {
      setMessage(error.message || "Суретті дайындау кезінде қате шықты");
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      const res = await API.put("/user/profile", {
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      setUser(res.data.user);
      setAvatarUrl(res.data.user?.avatar_url || "");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage(res.data.message || "Профиль жаңартылды");
    } catch (error) {
      setMessage(error.response?.data?.message || "Профильді жаңарту қатесі");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#eff6ff_36%,#f8fafc_100%)] px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">AuthGuard Locker</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">Профиль</h1>
              <p className="mt-2 text-slate-600">Аккаунт ақпараты, сурет және жеке деректерді жаңарту.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPage("dashboard")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Басты бет</button>
              <button onClick={() => setPage("logs")} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Әрекет тарихы</button>
              <button onClick={logout} className="rounded-2xl bg-slate-800 px-4 py-2.5 font-semibold text-white">Шығу</button>
            </div>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-sky-100 bg-white/95 px-4 py-3 text-slate-700 shadow-sm">{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[32px] border border-white/70 bg-slate-900 p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col items-center text-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-32 w-32 rounded-full object-cover ring-4 ring-white/20" />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-sky-500 text-4xl font-black text-white ring-4 ring-white/20">
                  {initials}
                </div>
              )}

              <h2 className="mt-5 text-2xl font-black">{fullName || user?.full_name || "Пайдаланушы"}</h2>
              <p className="mt-2 text-slate-300">{user?.email || "email"}</p>
              <div className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-sky-200">
                {user?.role || "user"}
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-black text-slate-900">Профильді өңдеу</h2>
            <p className="mt-2 text-slate-600">Мұнда атыңызды және профиль суретін жаңарта аласыз.</p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Аты-жөні</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 outline-none focus:border-sky-300"
                  placeholder="Аты-жөніңіз"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="text"
                  readOnly
                  value={user?.email || ""}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Профиль суреті</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="w-full rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-700 outline-none"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-slate-500">
                    PNG, JPG немесе WEBP таңдауға болады. Сурет автоматты түрде профильге лайықталып сақталады.
                  </p>
                  {avatarFileName && (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      {avatarFileName}
                    </span>
                  )}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("");
                        setAvatarFileName("");
                        setMessage("Сурет өшіруге дайын. Сақтау батырмасын басыңыз.");
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      Суретті өшіру
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="text-sm text-slate-500">Рөл</div>
                  <div className="mt-2 font-semibold text-slate-900">{user?.role || "user"}</div>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="text-sm text-slate-500">Тіркелген уақыты</div>
                  <div className="mt-2 font-semibold text-slate-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white">
                {saving ? "Сақталуда..." : "Өзгерістерді сақтау"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
