import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import Login from "@/components/Login";
import { authLogin } from "@/services/apis/api";

vi.mock("@/services/apis/api", () => ({ authLogin: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockedLogin = vi.mocked(authLogin);

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<div>Chat page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  await user.clear(emailInput);
  await user.type(emailInput, email);
  await user.clear(passwordInput);
  await user.type(passwordInput, password);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the heading, fields and submit button", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  it("submits the entered credentials", async () => {
    mockedLogin.mockResolvedValue({ data: { success: true } } as never);
    renderLogin();

    await fillAndSubmit("user@example.com", "secret123");

    expect(mockedLogin).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    });
  });

  it("navigates to /chat on success", async () => {
    mockedLogin.mockResolvedValue({ data: { success: true } } as never);
    renderLogin();

    await fillAndSubmit("user@example.com", "secret123");

    expect(await screen.findByText("Chat page")).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows the server error and stays on the page when login fails", async () => {
    mockedLogin.mockResolvedValue({
      data: { success: false, detail: "Incorrect password" },
    } as never);
    renderLogin();

    await fillAndSubmit("user@example.com", "wrong");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Incorrect password"));
    expect(screen.queryByText("Chat page")).not.toBeInTheDocument();
  });

  it("falls back to a generic message when no detail is returned", async () => {
    mockedLogin.mockResolvedValue({ data: { success: false } } as never);
    renderLogin();

    await fillAndSubmit("user@example.com", "wrong");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Login failed"));
  });

  it("disables the button and shows a loading label while signing in", async () => {
    let resolve!: (v: unknown) => void;
    mockedLogin.mockReturnValue(new Promise((r) => (resolve = r)) as never);
    renderLogin();

    await fillAndSubmit("user@example.com", "secret123");

    const button = await screen.findByRole("button", { name: /signing in/i });
    expect(button).toBeDisabled();

    resolve({ data: { success: true } });
    expect(await screen.findByText("Chat page")).toBeInTheDocument();
  });

  it("re-enables the button if the request throws", async () => {
    mockedLogin.mockRejectedValue(new Error("network"));
    renderLogin();

    await fillAndSubmit("user@example.com", "secret123");

    expect(await screen.findByRole("button", { name: /sign in/i })).toBeEnabled();
  });
});
