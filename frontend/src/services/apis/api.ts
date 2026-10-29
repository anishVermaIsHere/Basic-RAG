import { API_ENDPOINTS } from "@/services/apis/endpoints";
import { api } from "@/services/apis";


const { CHAT, AUTH } = API_ENDPOINTS;

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

export async function streamMessage(
  payload: { chatId?: string | null; content: string; sender: any },
  onChunk: (text: string) => void,
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
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) onChunk(text);
  }

  return { chatId: res?.headers["x-chat-id"] ?? null };
}
