import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Spinner } from "@/ui";


const LazyLoader = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Outlet />
    </Suspense>
  );
};


const LoginPage = lazy(() => import("@/pages/Login"));
const DocumentsPage = lazy(() => import("@/pages/Documents"));
const ChatPage = lazy(() => import("@/pages/Chat"));
const SourcesPage = lazy(() => import("@/pages/Sources"));
const SettingsPage = lazy(() => import("@/pages/Settings"));


export {
  LoginPage,
  DocumentsPage,
  ChatPage,
  SourcesPage,
  SettingsPage
}

export default LazyLoader;