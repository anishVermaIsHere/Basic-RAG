import { useState } from "react";
import { Check, FileCode, FileText, FileType, Pencil, Trash2, X } from "lucide-react";
import { Button, Input, Card, Badge } from "@/ui";
import { bytes, date } from "@/lib";
import type { Doc } from "@/types";

type Props = {
  doc: Doc;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => void;
};

function iconFor(name: string) {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return { Icon: FileText, tone: "bg-red-500/10 text-red-600" };
  if (ext === ".docx") return { Icon: FileType, tone: "bg-blue-500/10 text-blue-600" };
  if (ext === ".md") return { Icon: FileCode, tone: "bg-purple-500/10 text-purple-600" };
  return { Icon: FileText, tone: "bg-primary/10 text-primary" };
}

const STATUS_TONE: Record<string, string> = {
  ready: "bg-green-500/10 text-green-700",
  processing: "bg-amber-500/10 text-amber-700",
  pending: "bg-amber-500/10 text-amber-700",
  failed: "bg-red-500/10 text-red-700",
};

export default function DocumentCard({ doc, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(doc.name);
  const [saving, setSaving] = useState(false);
  const { Icon, tone } = iconFor(doc.name);

  function startEdit() {
    setName(doc.name);
    setEditing(true);
  }

  async function save() {
    const next = name.trim();
    if (!next || next === doc.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onRename(doc.id, next);
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <Card className="flex items-center gap-4 p-2 rounded-sm">
      <div className={`grid size-11 shrink-0 place-items-center rounded-sm ${tone}`}>
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <Input
            autoFocus
            value={name}
            disabled={saving}
            onChange={(e: any) => setName(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <p className="truncate text-sm font-medium" title={doc.name}>
            {doc.name}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {bytes(doc.size)} · {doc.chunks || 0} chunks · {date(doc.createdAt)}
        </p>
      </div>

      <Badge className={STATUS_TONE[doc.status]}>{doc.status}</Badge>

      {editing ? (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={save} disabled={saving} aria-label="Save name">
            <Check className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setEditing(false)} disabled={saving} aria-label="Cancel">
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={startEdit} aria-label="Rename document">
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)} aria-label="Delete document">
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
