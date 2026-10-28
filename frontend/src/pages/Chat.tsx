import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Copy,
  FileText,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { Button, Card, Textarea, Badge } from "../ui";
import { api } from "../services/apis";
import type { Message } from "../types";
import { toast } from "sonner";



export default function Chat() {
  const [msg, setMsg] = useState<Message[]>([
    {
      id: "w",
      role: "assistant",
      content:
        "Hi — ask a question and I’ll answer using the documents connected to this workspace.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);


  useEffect(
    () => { 
        bottom.current?.scrollIntoView({ behavior: "smooth" });
        return ()=> {} 
    },
    [msg, busy],
  );

  async function send(e: any) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    const q = text.trim();
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
    try {
      const a = await api.post<any>("/chat", { message: q, topK: 6 });
      setMsg((m) => [
        ...m,
        {
          ...a,
          id: a.id || crypto.randomUUID(),
          role: "assistant",
          createdAt: a.createdAt || new Date().toISOString(),
        },
      ]);
    } catch {
      toast.error("RAG API request failed");
      setMsg((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I couldn't reach the RAG backend. Check VITE_API_BASE_URL and the POST /chat contract.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-[1fr_300px]">
      <section className="flex min-h-0 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
            {msg.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${m.role === "user" ? "bg-foreground text-background" : "bg-primary text-white"}`}
                >
                  {m.role === "user" ? <User /> : <Bot />}
                </div>
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-sm px-3 py-1.5 text-sm leading-7 ${m.role === "user" ? "bg-primary text-white" : "border bg-card"}`}
                  >
                    {m.content}
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
            {busy && (
              <div className="flex gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-primary text-white">
                  <Bot />
                </div>
                <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                  Retrieving relevant chunks...
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
      <aside className="hidden border-l bg-muted/20 p-5 lg:block">
        <div className="flex items-center gap-2">
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
