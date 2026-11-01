import { API_ENDPOINTS } from "@/services/apis/endpoints";
import { api } from "@/services/apis";
import type { StreamEvent } from "@/types";


const { CHAT, AUTH, SOURCES } = API_ENDPOINTS;

export async function authLogin(credentials: any){
   return await api.post<any>(AUTH.login, credentials);
}

export async function authLogout(){
   return await api.post<any>(AUTH.logout, null);
}

export async function sendMessage(message: any){
 return await api.post<any>(CHAT.message, message);
}

export async function getChats(q?: string) {
  return await api.get<any[]>(CHAT.message, { params: q ? { q } : undefined });
}

export async function getChat(id: string) {
  const res = await api.get<any>(CHAT.one(id));
  return res?.data;
}

export async function deleteChat(id: string) {
  return await api.delete(CHAT.one(id));
}

export async function getSources(params: { q?: string; document_id?: string; limit?: number; offset?: number }) {
  const res = await api.get<any[]>(SOURCES.all, { params });
  return res?.data ?? [];
}

export async function getSourceStats() {
  const res = await api.get<any[]>(SOURCES.stats);
  return res?.data ?? [];
}

export async function streamMessage(
  payload: { chatId?: string | null; content: string; sender: any },
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<{ chatId: string | null }> {
  // axios needs the fetch adapter to expose the response body as a stream in the browser
  const res = await api.post<ReadableStream<Uint8Array>>(
    CHAT.message,
    {
      chat_id: payload.chatId ?? null,
      content: payload.content,
      sender: payload.sender,
    },
    { adapter: "fetch", responseType: "stream", signal },
  );

  const reader = (res?.data as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const flush = (frame: string) => {
    const line = frame.split("\n").find((l) => l.startsWith("data:"));
    if (!line) return;
    const event = JSON.parse(line.slice(5).trim()) as StreamEvent;
    if (event.type === "error") throw new Error(event.message || "Stream failed");
    onEvent(event);
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE frames are separated by a blank line; a frame may span multiple reads
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    frames.forEach(flush);
  }
  if (buffer.trim()) flush(buffer);

  return { chatId: res?.headers["x-chat-id"] ?? null };
}
