import { Toaster } from "sonner";
import AppRouteProvider from "@/providers/AppRouteProvider";

export default function App() {
  return (
    <>
      <AppRouteProvider />
      <Toaster position="bottom-right" />
    </>
  );
}
