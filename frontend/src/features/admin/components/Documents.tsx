import { useRef, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button, Input, Card, Badge } from "@/ui";
import { api } from "@/services/apis/api";
import { bytes, date } from "@/lib";
import { toast } from "sonner";
import type { Doc } from "@/types";


export default function Documents() {
  const [data, setData] = useState<Doc[]>([]);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const load = () =>
    api
      .get<Doc[]>("/documents")
      .then(setData)
      .catch(() => setData([]));
  useState(() => {
    load();
  });
  async function upload(f?: File) {
    if (!f) return;
    try {
      await api.upload("/documents/upload", f);
      toast.success("Uploaded");
      load();
    } catch {
      toast.error("Upload failed");
    }
  }
  async function del(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await api.del(`/documents/${id}`);
      load();
    } catch {
      toast.error("Delete failed");
    }
  }
  const rows = data.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-6 p-4 md:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold">Knowledge base</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and manage the documents used by retrieval.
          </p>
        </div>
        <input
          ref={input}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.csv"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <Button onClick={() => input.current?.click()}>
          <Plus />
          Add document
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Documents</p>
          <b className="text-2xl">{data.length}</b>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Ready</p>
          <b className="text-2xl">
            {data.filter((d) => d.status === "ready").length}
          </b>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Processing</p>
          <b className="text-2xl">
            {data.filter((d) => d.status === "processing").length}
          </b>
        </Card>
      </div>
      <Card>
        <div className="flex gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              placeholder="Search documents"
            />
          </div>
          <Button variant="outline" onClick={load}>
            <RefreshCw />
          </Button>
        </div>
        {rows.length ? (
          <div className="divide-y">
            {rows.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-4">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bytes(d.size)} · {d.chunks || 0} chunks ·{" "}
                    {date(d.createdAt)}
                  </p>
                </div>
                <Badge>{d.status}</Badge>
                <Button variant="ghost" size="icon" onClick={() => del(d.id)}>
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <UploadCloud className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No documents found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload PDFs, Word files, Markdown, CSV, or text.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
