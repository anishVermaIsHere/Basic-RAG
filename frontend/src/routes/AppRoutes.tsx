import LazyLoader, { ChatPage, DocumentsPage, SourcesPage, SettingsPage, LoginPage } from "@/components/common/LazyLoad"
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
            path: '/sources',
            element: <SourcesPage />,
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