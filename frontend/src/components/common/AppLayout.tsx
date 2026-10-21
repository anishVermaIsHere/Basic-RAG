import { useState, useEffect }  from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bot,
  Database,
  FileText,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Search,
} from "lucide-react";
import { Button, Input } from "@/ui";


const links = [
  ["/chat", "Chat", MessageSquare],
  ["/documents", "Documents", FileText],
  ["/sources", "Sources", Database],
  ["/settings", "Settings", Settings],
] as const;



export default function AppLayout() {
  const [dark, setDark] = useState(localStorage.getItem("theme") !== "light");
  const loc = useLocation();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  const title = links.find((x) => x[0] === loc.pathname)?.[1] || "Workspace";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <b>RAG Workspace</b>
            <p className="text-[11px] text-muted-foreground">
              Knowledge assistant
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-2xl border p-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-muted">
              <Bot className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">RAG Assistant</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl md:px-7">
          <div>
            <h1 className="font-semibold">{title}</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Grounded answers from your knowledge base
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden w-52 md:block">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search" />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
              {dark ? <Sun /> : <Moon />}
            </Button>
            <div className="grid size-9 place-items-center rounded-full bg-linear-to-br from-primary to-violet-500 text-xs font-bold text-white">
              RK
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

