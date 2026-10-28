import { Toaster } from "sonner";
import AppRouteProvider from "@/providers/AppRouteProvider";
import QueryProvider from "@/providers/QueryProvider";

export default function App() {
  return (
    <QueryProvider>
      <AppRouteProvider />
      <Toaster position="top-center" />
    </QueryProvider>
  );
}
