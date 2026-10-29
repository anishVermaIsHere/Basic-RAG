import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import appConfig from "@/config/config";
import { toast } from "sonner";


const BASE = `${appConfig.baseUrl}/api/v1`;

const axiosInstance = axios.create({
  baseURL: BASE,
  withCredentials: true
})

async function req<T>(path: string, opt: RequestInit = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse | undefined> {
  const headers = new Headers(opt.headers);

  if (!(opt.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try{
    const r = await axiosInstance({
      url: path,
      method: opt.method ?? "GET",
      headers: Object.fromEntries(headers.entries()),
      data: opt.body,
      ...config,
    });
    // return r.status === 204 ? (undefined as T) : r.data; (Promise<T>)
    return r;
  } catch(err){
    if (axios.isAxiosError(err)) {
      // console.error("API Error Response:", {
      //   status: err.response?.status,
      //   data: err.response?.data, // This contains your FastAPI {"detail": "..."} message
      //   message: err.message,
      // });
      toast.error(err?.response?.data?.detail || err?.message);
    } else {
      console.error("Unexpected Error:", err);
    }
    
    // Re-throw the error if you want the component calling `req` to also handle it
    throw err;
  }
}

export const api = {
  get: <T>(p: string, config?: AxiosRequestConfig) => req<T>(p, {}, config),
  post: <T>(p: string, b: any, config?: AxiosRequestConfig) =>
    req<T>(p, {
      method: "POST",
      body: b instanceof FormData ? b : JSON.stringify(b),
    }, config),
  patch: <T>(p: string, b: any) =>
    req<T>(p, { method: "PATCH", body: JSON.stringify(b) }),
  del: <T>(p: string) => req<T>(p, { method: "DELETE" }),
  upload: <T>(p: string, f: File) => {
    const b = new FormData();
    b.append("file", f);
    return req<T>(p, { method: "POST", body: b });
  },
};
