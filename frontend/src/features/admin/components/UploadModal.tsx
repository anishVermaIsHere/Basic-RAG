import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, Spinner } from "@/ui";
import { uploadFile } from "../apis/document";
import { bytes } from "@/lib";
import { ALLOWED_EXTS, MAX_FILE_SIZE } from "@/utils/constant";
import { Status, Item } from "@/types";


type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
};

function validate(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTS.includes(ext)) return `${file.name}: unsupported file type`;
  if (file.size === 0) return `${file.name}: file is empty`;
  if (file.size > MAX_FILE_SIZE) return `${file.name}: exceeds 10 MB limit`;
  return null;
}

export default function UploadModal({ open, onClose, onUploaded }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  if (!open) return null;

  function close() {
    if (busy) return;
    setItems([]);
    setDragging(false);
    onClose();
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added: Item[] = [];
    for (const file of Array.from(list)) {
      const err = validate(file);
      if (err) {
        toast.error(err);
        continue;
      }
      added.push({ id: crypto.randomUUID(), file, status: "pending" });
    }
    setItems((prev) => [...prev, ...added]);
  }

  function setStatus(id: string, status: Status) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function uploadAll() {
    const queue = items.filter((i) => i.status === "pending" || i.status === "error");
    if (!queue.length) return;
    setBusy(true);
    let uploaded = 0;
    for (const item of queue) {
      setStatus(item.id, "uploading");
      try {
        // api.upload already shows an error toast on failure
        await uploadFile(item.file);
        setStatus(item.id, "done");
        uploaded++;
      } catch {
        setStatus(item.id, "error");
      }
    }
    setBusy(false);
    if (uploaded) {
      toast.success(`${uploaded} document${uploaded > 1 ? "s" : ""} uploaded`);
      onUploaded();
      onClose();
    }
  }

  const pendingCount = items.filter((i) => i.status === "pending" || i.status === "error").length;
  const allDone = items.length > 0 && items.every((i) => i.status === "done");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload documents"
        className="w-full max-w-lg rounded-2xl border bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Upload documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF, DOCX, TXT or Markdown, up to 10 MB each.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={close} disabled={busy}>
            <X className="size-4" />
          </Button>
        </div>

        <div
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) addFiles(e.dataTransfer.files);
          }}
          className={`mt-5 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60"
          }`}
        >
          <UploadCloud className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Drag & drop files here</p>
          <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
          <input
            ref={input}
            type="file"
            multiple
            className="hidden"
            accept={ALLOWED_EXTS.join(",")}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = ""; // allow re-selecting the same file
            }}
          />
        </div>

        {items.length > 0 && (
          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                <FileText className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.file.name}</p>
                  <p className="text-xs text-muted-foreground">{bytes(i.file.size)}</p>
                </div>
                {i.status === "uploading" && <Spinner />}
                {i.status === "done" && <CheckCircle2 className="size-5 text-green-600" />}
                {i.status === "error" && <XCircle className="size-5 text-destructive" />}
                {(i.status === "pending" || i.status === "error") && !busy && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close} disabled={busy}>
            {allDone ? "Close" : "Cancel"}
          </Button>
          {!allDone && (
            <Button onClick={uploadAll} disabled={busy || pendingCount === 0}>
              {busy ? "Uploading..." : `Upload${pendingCount ? ` (${pendingCount})` : ""}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
