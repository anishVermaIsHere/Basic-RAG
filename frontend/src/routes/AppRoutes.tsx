import LazyLoader, { ChatPage, DocumentsPage, SettingsPage, LoginPage, KnowledgeBasePage } from "@/components/common/LazyLoad"
import AppLayout from "@/components/common/AppLayout";



const appRoutes = [
   {
    element: <AppLayout />,
    children: [
      {
        element: <LazyLoader />,
        children: [
          {
            path: '/documents',
            element: <DocumentsPage />,
          },
           {
            path: '/knowledgebase',
            element: <KnowledgeBasePage />,
          },
           {
            path: '/settings',
            element: <SettingsPage />,
          },
          {
            path: '/chat',
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