import { useState } from "react";
import { Button, Input, Card } from "../ui";
import { toast } from "sonner";


export default function Settings() {
  const [url, setUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  );
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-7">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Backend integration and frontend behavior.
        </p>
      </div>
      <Card className="p-6">
        <h3 className="font-semibold">RAG API</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Set this in .env for deployments. This field is only a browser-side
          convenience.
        </p>
        <Input
          className="mt-5"
          value={url}
          onChange={(e: any) => setUrl(e.target.value)}
        />
        <Button
          className="mt-4"
          onClick={() =>
            toast.success("Saved locally. Update .env to make it permanent.")
          }
        >
          Save
        </Button>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold">Expected API surface</h3>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {[
            "POST /auth/login",
            "POST /chat",
            "GET /documents",
            "POST /documents/upload",
            "DELETE /documents/:id",
            "GET /sources",
            "GET /collections",
          ].map((x) => (
            <div className="rounded-xl bg-muted p-4" key={x}>
              {x}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
