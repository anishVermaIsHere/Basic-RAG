import {
  Bot,
  Database,
  FileText,
  MessageSquareText,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Search,
  User,
  House,
  SquareArrowRight
} from "lucide-react";


const ROUTES = {
    HOME: { path: "/", label: "Home", Icon: House },
    LOGIN: { path: "/auth/login", label: "Login", Icon: SquareArrowRight },
    CHAT: { path: "/chat", label: "Chat", Icon: MessageSquareText },
    DOCS: { path: "/documents", label: "Documents", Icon: FileText },
    KNOWLEDGE: { path: "/knowledgebase", label: "Knowledge Base", Icon: Database },
    SETTINGS: { path: "/settings", label: "Settings", Icon: Settings },
    PROFILE: { path: "/profile", label: "My Profile", Icon: User }
}

export default ROUTES