import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button, Card, Input } from "../ui";
import { api } from "../services/apis/api";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/services/apis/endpoints";
import AppConfig from "@/config/config";


const { AUTH } = API_ENDPOINTS;

export default function Login() {
  const [email, setEmail] = useState(AppConfig.test.email);
  const [pw, setPw] = useState(AppConfig.test.password);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function go(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<any>(AUTH.login, { email, password: pw });
      const isSuccess = res?.data?.success;
      if(isSuccess){
        nav("/chat");
      }
      if(!isSuccess) {
        toast.error(res?.data?.detail || "Login failed");
      }
    } catch (error){
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(124,58,237,.18),transparent_42%)] p-4">
      <Card className="w-full max-w-md p-7 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-white">
            <Sparkles />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your RAG workspace
          </p>
        </div>
        <form onSubmit={go} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <Input
              className="mt-2"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <Input
              className="mt-2"
              type="password"
              value={pw}
              onChange={(e: any) => setPw(e.target.value)}
              required
            />
          </label>
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
