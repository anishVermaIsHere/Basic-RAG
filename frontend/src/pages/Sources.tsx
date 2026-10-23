import { useEffect, useState } from "react";
import { FileText, ExternalLink, Search } from "lucide-react";
import { Card, Input, Badge } from "../ui";
import { api } from "../services/apis/api";
import type { Source } from "../types";


export default function Sources() {
  const [data, setData] = useState<Source[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    api
      .get<Source[]>("/sources")
      .then(setData)
      .catch(() => {});
  }, []);
  const rows = data.filter((x) =>
    (x.title + " " + (x.snippet || "")).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-6 p-4 md:p-7">
      <div>
        <h2 className="text-2xl font-semibold">Sources</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect retrieved chunks, pages, URLs and similarity scores.
        </p>
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={q}
          onChange={(e: any) => setQ(e.target.value)}
          placeholder="Search sources"
        />
      </div>
      <div className="grid gap-4">
        {rows.map((s, i) => (
          <Card key={s.id || i} className="p-5">
            <div className="flex gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                <FileText />
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <b>{s.title}</b>
                  {s.score != null && <Badge>score {s.score.toFixed(2)}</Badge>}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {s.snippet || "No snippet."}
                </p>
                <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                  {s.page && <span>Page {s.page}</span>}
                  {s.url && (
                    <a
                      className="text-primary hover:underline"
                      href={s.url}
                      target="_blank"
                    >
                      Open source <ExternalLink className="inline size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
