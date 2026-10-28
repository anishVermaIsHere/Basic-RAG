import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import Documents from "./Documents";
import { deleteDocument, fetchDocuments, uploadFile } from "../apis/document";

vi.mock("../apis/document", () => ({
  fetchDocuments: vi.fn(),
  uploadFile: vi.fn(),
  deleteDocument: vi.fn(),
  renameDocumentName: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockedFetch = vi.mocked(fetchDocuments);
const mockedUpload = vi.mocked(uploadFile);
const mockedDelete = vi.mocked(deleteDocument);

// shape returned by the backend
const apiDocs = [
  {
    id: "1",
    filename: "report.pdf",
    content_type: "application/pdf",
    file_size: 2048,
    status: "ready",
    chunks: 12,
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "2",
    filename: "notes.md",
    content_type: "text/markdown",
    file_size: 512,
    status: "pending", // UI shows this as "processing"
    chunks: 0,
    created_at: "2026-01-02T10:00:00Z",
  },
];

const respond = (docs: unknown[]) => ({ data: docs }) as never;

function renderDocuments() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Documents />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetch.mockResolvedValue(respond(apiDocs));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetch documents", () => {
  it("loads and lists documents from the API", async () => {
    renderDocuments();

    expect(await screen.findByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("notes.md")).toBeInTheDocument();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("maps the backend 'pending' status to 'processing'", async () => {
    renderDocuments();

    await screen.findByText("notes.md");
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(screen.getByText("processing", { selector: "span" })).toBeInTheDocument();
    expect(screen.queryByText("pending")).not.toBeInTheDocument();
  });

  it("shows total, ready and processing counts", async () => {
    renderDocuments();
    await screen.findByText("report.pdf");

    const count = (label: string) =>
      screen.getByText(label, { selector: "p" }).parentElement!.querySelector("b")!.textContent;
    expect(count("Documents")).toBe("2");
    expect(count("Ready")).toBe("1");
    expect(count("Processing")).toBe("1");
  });

  it("shows the empty state when there are no documents", async () => {
    mockedFetch.mockResolvedValue(respond([]));
    renderDocuments();

    expect(await screen.findByText("No documents found")).toBeInTheDocument();
  });

  it("filters documents by the search box", async () => {
    const user = userEvent.setup();
    renderDocuments();
    await screen.findByText("report.pdf");

    await user.type(screen.getByPlaceholderText("Search documents"), "NOTES");

    expect(screen.getByText("notes.md")).toBeInTheDocument();
    expect(screen.queryByText("report.pdf")).not.toBeInTheDocument();
  });

  it("refetches when the refresh button is clicked", async () => {
    const user = userEvent.setup();
    renderDocuments();
    await screen.findByText("report.pdf");

    // the refresh button is the only button in the search toolbar
    const toolbar = screen.getByPlaceholderText("Search documents").closest("div")!.parentElement!;
    await user.click(within(toolbar).getByRole("button"));

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
  });
});

describe("upload documents", () => {
  async function openModal() {
    const user = userEvent.setup();
    renderDocuments();
    await screen.findByText("report.pdf");
    await user.click(screen.getByRole("button", { name: /^document$/i }));
    const dialog = await screen.findByRole("dialog", { name: /upload documents/i });
    const input = dialog.querySelector<HTMLInputElement>("input[type=file]")!;
    return { user, dialog, input };
  }

  it("opens the upload dialog", async () => {
    const { dialog } = await openModal();

    expect(within(dialog).getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /^upload$/i })).toBeDisabled();
  });

  it("uploads the selected file, refreshes the list and closes the dialog", async () => {
    mockedUpload.mockResolvedValue(undefined);
    const { user, dialog, input } = await openModal();
    const file = new File(["hello"], "guide.txt", { type: "text/plain" });

    await user.upload(input, file);
    expect(within(dialog).getByText("guide.txt")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /upload \(1\)/i }));

    await waitFor(() => expect(mockedUpload).toHaveBeenCalledWith(file));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("1 document uploaded"));
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("uploads several files one by one", async () => {
    mockedUpload.mockResolvedValue(undefined);
    const { user, dialog, input } = await openModal();
    const a = new File(["a"], "a.txt", { type: "text/plain" });
    const b = new File(["b"], "b.md", { type: "text/markdown" });

    await user.upload(input, [a, b]);
    await user.click(within(dialog).getByRole("button", { name: /upload \(2\)/i }));

    await waitFor(() => expect(mockedUpload).toHaveBeenCalledTimes(2));
    expect(mockedUpload).toHaveBeenNthCalledWith(1, a);
    expect(mockedUpload).toHaveBeenNthCalledWith(2, b);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("2 documents uploaded"));
  });

  it("rejects unsupported file types without uploading", async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderDocuments();
    await screen.findByText("report.pdf");
    await user.click(screen.getByRole("button", { name: /^document$/i }));
    const dialog = await screen.findByRole("dialog");
    const input = dialog.querySelector<HTMLInputElement>("input[type=file]")!;

    await user.upload(input, new File(["x"], "image.png", { type: "image/png" }));

    expect(toast.error).toHaveBeenCalledWith("image.png: unsupported file type");
    expect(within(dialog).queryByText("image.png")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /^upload$/i })).toBeDisabled();
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it("rejects empty files", async () => {
    const { user, input } = await openModal();

    await user.upload(input, new File([], "empty.txt", { type: "text/plain" }));

    expect(toast.error).toHaveBeenCalledWith("empty.txt: file is empty");
  });

  it("rejects files over 10 MB", async () => {
    const { user, input } = await openModal();
    const big = new File(["x"], "big.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: 10 * 1024 * 1024 + 1 });

    await user.upload(input, big);

    expect(toast.error).toHaveBeenCalledWith("big.pdf: exceeds 10 MB limit");
  });

  it("keeps the dialog open and allows retry when the upload fails", async () => {
    mockedUpload.mockRejectedValue(new Error("boom"));
    const { user, dialog, input } = await openModal();

    await user.upload(input, new File(["x"], "guide.txt", { type: "text/plain" }));
    await user.click(within(dialog).getByRole("button", { name: /upload \(1\)/i }));

    await waitFor(() => expect(mockedUpload).toHaveBeenCalledTimes(1));
    expect(await within(dialog).findByRole("button", { name: /upload \(1\)/i })).toBeEnabled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("lets the user remove a queued file", async () => {
    const { user, dialog, input } = await openModal();

    await user.upload(input, new File(["x"], "guide.txt", { type: "text/plain" }));
    const row = within(dialog).getByText("guide.txt").closest("li")!;
    await user.click(within(row).getByRole("button"));

    expect(within(dialog).queryByText("guide.txt")).not.toBeInTheDocument();
  });
});

describe("delete documents", () => {
  async function clickDelete(name: string) {
    const user = userEvent.setup();
    renderDocuments();
    const label = await screen.findByText(name);
    const card = label.closest("div.flex") as HTMLElement;
    await user.click(within(card).getByRole("button", { name: /delete document/i }));
  }

  it("deletes after confirmation and refreshes the list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDelete.mockResolvedValue(undefined as never);

    await clickDelete("report.pdf");

    expect(window.confirm).toHaveBeenCalledWith("Delete this document?");
    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith("1"));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Document deleted"));
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
  });

  it("removes the document from the list once the refetch no longer returns it", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDelete.mockResolvedValue(undefined as never);
    mockedFetch.mockResolvedValueOnce(respond(apiDocs)).mockResolvedValue(respond([apiDocs[1]]));

    await clickDelete("report.pdf");

    await waitFor(() => expect(screen.queryByText("report.pdf")).not.toBeInTheDocument());
    expect(screen.getByText("notes.md")).toBeInTheDocument();
  });

  it("does nothing when the confirmation is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    await clickDelete("report.pdf");

    expect(mockedDelete).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("shows an error and does not refetch when deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDelete.mockRejectedValue(new Error("boom"));

    await clickDelete("report.pdf");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Deletion failed"));
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });
});
