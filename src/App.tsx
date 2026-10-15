import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RackProvider } from '@/store/RackStore';
import { UIProvider } from '@/store/UIStore';
import { AppShell } from '@/components/layout/AppShell';
import { FeedPage } from '@/pages/FeedPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

// UIProvider lives inside the router so its modals can navigate & link.
const router = createBrowserRouter([
  {
    element: (
      <UIProvider>
        <AppShell />
      </UIProvider>
    ),
    // Fallback if the shell itself throws.
    errorElement: <RouteErrorPage fullPage />,
    children: [
      {
        // Page-level errors render inside the shell, so the nav keeps working.
        errorElement: <RouteErrorPage />,
        children: [
          { path: '/', element: <FeedPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/u/:handle', element: <ProfilePage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/search', element: <SearchPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export function App() {
  return (
    <RackProvider>
      <RouterProvider router={router} />
    </RackProvider>
  );
}
