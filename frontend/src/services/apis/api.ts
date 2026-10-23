import axios from "axios";
import appConfig from "@/config/config";


const BASE = `${appConfig.baseUrl}/api/v1`;

const axiosInstance = axios.create({
  baseURL: BASE,
  withCredentials: true
})

async function req<T>(path: string, opt: RequestInit = {}): Promise<T> {
  const headers = new Headers(opt.headers);

  if (!(opt.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("rag_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const r = await axiosInstance.request<T>({
    url: path,
    method: opt.method ?? "GET",
    headers: Object.fromEntries(headers.entries()),
    data: opt.body,
  });

  return r.status === 204 ? (undefined as T) : r.data;
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
