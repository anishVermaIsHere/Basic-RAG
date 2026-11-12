import LazyLoader, { ChatPage, DocumentsPage, SettingsPage, LoginPage, KnowledgeBasePage } from "@/components/common/LazyLoad"
import AuthLayout from "@/components/common/AuthLayout";
import ROUTES from "./routes";


const { DOCS, SETTINGS, CHAT, KNOWLEDGE } = ROUTES;

const appRoutes = [
   {
    element: <AuthLayout />,
    children: [
      {
        element: <LazyLoader />,
        children: [
          {
            path: DOCS.path,
            element: <DocumentsPage />,
          },
           {
            path: KNOWLEDGE.path,
            element: <KnowledgeBasePage />,
          },
           {
            path: SETTINGS.path,
            element: <SettingsPage />,
          },
          {
            path: CHAT.path,
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <LoginPage />
  },
];

export default appRoutes;