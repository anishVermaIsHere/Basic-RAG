const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";


async function req<T>(path: string, opt: RequestInit = {}): Promise<T> {
  const h = new Headers(opt.headers);
  if (!(opt.body instanceof FormData))
    h.set("Content-Type", "application/json");
  const t = localStorage.getItem("rag_token");
  if (t) h.set("Authorization", `Bearer ${t}`);
  const r = await fetch(BASE + path, { ...opt, headers: h });
  if (!r.ok) throw Error((await r.text()) || r.statusText);
  return r.status === 204 ? (undefined as T) : r.json();
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, b: any) =>
    req<T>(p, {
      method: "POST",
      body: b instanceof FormData ? b : JSON.stringify(b),
    }),
  del: <T>(p: string) => req<T>(p, { method: "DELETE" }),
  upload: <T>(p: string, f: File) => {
    const b = new FormData();
    b.append("file", f);
    return req<T>(p, { method: "POST", body: b });
  },
};
