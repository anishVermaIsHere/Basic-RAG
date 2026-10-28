import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Search, UploadCloud } from "lucide-react";
import { Button, Input, Card } from "@/ui";
import { api } from "@/services/apis";
import { toast } from "sonner";
import type { Doc } from "@/types";
import UploadModal from "./UploadModal";
import DocumentCard from "./DocumentCard";
import { API_ENDPOINTS } from "@/services/apis/endpoints";
import { fetchDocuments, deleteDocument, renameDocumentName } from "../apis/document";


export default function Documents() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isPending, data } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments
  });


  const documents: Doc[] = (data?.data ?? [])?.map((d: any) => ({
      id: d.id,
      name: d.filename,
      type: d.content_type,
      size: d.file_size,
      status: d.status === "pending" ? "processing" : d.status,
      chunks: d.chunks,
      createdAt: d.created_at,
  }));

  async function reValidateDocs(){
    await queryClient.invalidateQueries({ queryKey: ["documents"] });
  }


  async function del(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
      // load();
      await reValidateDocs();
    } catch {
      toast.error("Deletion failed");
    }
  }

  async function rename(id: string, name: string) {
    try {
      await renameDocumentName(id, { filename: name });
      // setData((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));
      await reValidateDocs();
      toast.success("Document renamed");
      return true;
    } catch {
      return false;
    }
  }

  const rows = documents?.filter((d) =>
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
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4"/>
          Document
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Documents</p>
          <b className="text-2xl">{documents.length}</b>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Ready</p>
          <b className="text-2xl">
            {documents.filter((d) => d.status === "ready").length}
          </b>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Processing</p>
          <b className="text-2xl">
            {documents.filter((d) => d.status === "processing").length}
          </b>
        </Card>
      </div>
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              placeholder="Search documents"
            />
          </div>
          <Button variant="outline" onClick={reValidateDocs}>
            <RefreshCw className="size-4"/>
          </Button>
        </div>
        {rows.length ? (
          <div className="space-y-3 p-4">
            {rows.map((d) => (
              <DocumentCard key={d.id} doc={d} onRename={rename} onDelete={del} />
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
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={reValidateDocs}
      />
    </div>
  );
}
