import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUp,
  Bot,
  Copy,
  FileText,
  Sparkles,
  MessageSquare,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { Button, Card, Input, Textarea } from "../ui";
import { getChat, getChats, streamMessage } from "@/services/apis/api";
import type { ChatSummary, Message } from "../types";
import { toast } from "sonner";
import MarkdownRenderer from "./common/MarkdownRender";


const SUGGESTED_PROMPTS = [
  "Summarize the key points from my uploaded documents",
  "What topics are covered across my documents?",
  "Find the most important dates, names, or figures mentioned",
];

export default function ChatPanel() {
  const [msg, setMsg] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(false);
  const { data } = useQuery({ queryKey: ["chats", search], queryFn: async() => await getChats(search.trim()) });
 const chats = data?.data || [];
  const bottom = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const defaultErrorMessage = "Oh no! It seems I'm unable to generate a response right now.\n Please try again or feel free to reach out to our customer support for assistance.";


  useEffect(() => () => abortRef.current?.abort(), []);


  function newChat() {
    abortRef.current?.abort();
    setBusy(false);
    setChatId(null);
    setMsg([]);
  }

  async function openChat(id: string) {
    if (id === chatId) return;
    abortRef.current?.abort();
    setBusy(false);
    try {
      const chat = await getChat(id);
      setChatId(id);
      setMsg(
        (chat?.messages ?? []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        })),
      );
    } catch {
      // api layer already shows an error toast
    }
  }


  useEffect(
    () => { 
        bottom.current?.scrollIntoView({ behavior: "smooth" });
        return ()=> {} 
    },
    [msg, busy],
  );

  async function send(e: any, override?: string) {
    e?.preventDefault?.();
    const q = (override ?? text).trim();
    if (!q || busy) return;
    setText("");
    setMsg((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: q,
        createdAt: new Date().toISOString(),
      },
    ]);
    setBusy(true);
    const assistantId = crypto.randomUUID();
    let started = false;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { chatId: newId } = await streamMessage(
        // TODO: replace sender id with the logged-in user's id
        { chatId, content: q, sender: { id: "user", location: {} } },
        (chunk) => {
          if (!started) {
            started = true;
            setMsg((m) => [
              ...m,
              {
                id: assistantId,
                role: "assistant",
                content: chunk,
                createdAt: new Date().toISOString(),
              },
            ]);
          } else {
            setMsg((m) =>
              m.map((x) =>
                x.id === assistantId ? { ...x, content: x.content + chunk } : x,
              ),
            );
          }
        },
        controller.signal,
      );
      if (newId) setChatId(newId);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast.error("RAG API request failed");
      const fallback = defaultErrorMessage || "Oops something went wrong at server";
      setMsg((m) =>
        started
          ? m.map((x) =>
              x.id === assistantId
                ? { ...x, content: x.content + "\n\n[Response interrupted]" }
                : x,
            )
          : [
              ...m,
              {
                id: assistantId,
                role: "assistant",
                content: fallback,
                createdAt: new Date().toISOString(),
              },
            ],
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-[1fr_300px]">
      <section className="flex min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-6 px-2 py-4">
            {!msg.length && !busy && (
              <div className="flex flex-col items-center gap-6 py-16 text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary text-white">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">How can I help you today?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask a question about your documents, or try one of these:
                  </p>
                </div>
                <div className="grid w-full max-w-xl gap-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => send(null, p)}
                      className="rounded-sm border bg-card px-4 py-3 text-left text-sm hover:bg-muted"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msg.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`grid size-8 shrink-0 place-items-center rounded-xl ${m.role === "user" ? "bg-gray-600 text-background" : "bg-primary text-white"}`}
                >
                  {m.role === "user" ? <User className="size-4"/> : <Bot className="size-4" />}
                </div>
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-sm px-2.5 py-1 text-sm leading-7 ${m.role === "user" ? "bg-gray-200" : "border bg-card"}`}
                  >
                    <MarkdownRenderer key={m.id} keyIndex={m.id} content={m.content}/>
                  </div>
                  {m.sources?.length ? (
                    <div className="mt-3 space-y-2">
                      {m.sources.map((s) => (
                        <Card key={s.id} className="p-3">
                          <div className="flex gap-2">
                            <FileText className="size-4 text-primary" />
                            <div>
                              <b className="text-xs">{s.title}</b>
                              <p className="text-xs text-muted-foreground">
                                {s.snippet}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : null}
                  {m.role === "assistant" && (
                    <Button variant="ghost" size="icon">
                      <Copy className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {busy && msg[msg.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-primary text-white">
                  <Bot />
                </div>
                <div className="rounded-sm border bg-card px-4 py-3 text-sm text-muted-foreground">
                  Retrieving your request...
                </div>
              </div>
            )}
            <div ref={bottom} />
          </div>
        </div>
        <div className="border-t bg-background/95 p-4">
          <form
            onSubmit={send}
            className="mx-auto max-w-4xl rounded-2xl border bg-card p-2 shadow-lg"
          >
            <Textarea
              value={text}
              onChange={(e: any) => setText(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e);
                }
              }}
              placeholder="Ask anything about your documents..."
              className="border-0 pr-14 shadow-none"
            />
            <div className="flex justify-end">
              <Button size="icon" disabled={!text.trim() || busy}>
                <ArrowUp />
              </Button>
            </div>
          </form>
        </div>
      </section>
      <aside className="hidden min-h-0 flex-col overflow-y-auto border-l bg-muted/20 p-5 lg:flex">
        <div className="flex items-center justify-between">
          <b>Chats</b>
          <Button variant="ghost" size="icon" onClick={newChat} title="New chat">
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="pl-8"
          />
        </div>
        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {chats?.map((c) => (
            <button
              key={c.id}
              onClick={() => openChat(c.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted ${c.id === chatId ? "bg-muted font-medium" : ""}`}
            >
              <MessageSquare className="size-3.5 shrink-0" />
              <span className="truncate">{c.title}</span>
            </button>
          ))}
          {!chats.length && !loadingChats && (
            <p className="px-2 text-xs text-muted-foreground">
              {search.trim() ? "No chats match your search." : "No chats yet."}
            </p>
          )}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          <b>Retrieval controls</b>
        </div>
        <div className="mt-6 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">Top K</p>
          <p className="mt-1 text-xs text-muted-foreground">
            6 chunks per query
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full bg-primary" />
          </div>
        </div>
        <div className="mt-3 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">Grounded answers</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Citations returned by your backend are rendered beneath each answer.
          </p>
        </div>
      </aside>
    </div>
  );
}
