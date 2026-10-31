import { useEffect, useState } from "react";
import { FileText, ChevronDown, ChevronUp, MessageSquare, Search } from "lucide-react";
import { Card, Input, Badge, Spinner } from "@/ui";
import { getSources, getSourceStats } from "@/services/apis/api";
import { date } from "@/lib";
import type { Source, SourceStat } from "@/types";

const PAGE_SIZE = 20;

export default function Sources() {
  const [data, setData] = useState<Source[]>([]);
  const [stats, setStats] = useState<SourceStat[]>([]);
  const [q, setQ] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    getSourceStats().then(setStats).catch(() => {});
  }, []);

  async function load(offset: number) {
    setLoading(true);
    try {
      const rows = await getSources({
        q: q.trim() || undefined,
        document_id: documentId || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setData((d) => (offset ? [...d, ...rows] : rows));
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      // api layer already shows an error toast
    } finally {
      setLoading(false);
    }
  }

  // debounced reload on search / filter change
  useEffect(() => {
    const t = setTimeout(() => load(0), 300);
    return () => clearTimeout(t);
  }, [q, documentId]);

  return (
    <div className="space-y-6 p-4 md:p-7">
      <div>
        <h2 className="text-2xl font-semibold">Sources</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Document chunks used to answer your questions, with similarity scores.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-64 max-w-xl flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={q}
            onChange={(e: any) => setQ(e.target.value)}
            placeholder="Search chunk text or document name"
          />
        </div>
        <select
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="h-10 rounded-sm border bg-background px-3 text-sm"
        >
          <option value="">All documents</option>
          {stats.map((s) => (
            <option key={s.document_id} value={s.document_id}>
              {s.title} ({s.citations})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {data.map((s) => {
          const expanded = open === s.id;
          return (
            <Card key={s.id} className="p-5">
              <div className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                  <FileText />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <b>{s.title}</b>
                    <div className="flex gap-2">
                        {s.score != null && <Badge>score {s.score.toFixed(2)}</Badge>}
                        {s.chunk_index != null && <Badge>chunk {s.chunk_index}</Badge>}
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {expanded ? s.content : s.snippet || "No snippet."}
                    {!expanded && s.content && s.content.length > (s.snippet?.length ?? 0) && "…"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {s.page && <span>Page {s.page}</span>}
                    {s.chat_title && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3" /> {s.chat_title}
                      </span>
                    )}
                    {s.created_at && <span>{date(s.created_at)}</span>}
                    <button
                      className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                      onClick={() => setOpen(expanded ? null : s.id)}
                    >
                      {expanded ? "Show less" : "Show full chunk"}
                      {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {loading && (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        )}
        {!loading && !data.length && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {q.trim() || documentId
              ? "No sources match your filters."
              : "No sources yet. Chunks cited in chat answers will appear here."}
          </p>
        )}
        {!loading && hasMore && (
          <button
            className="mx-auto text-sm text-primary hover:underline"
            onClick={() => load(data.length)}
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
