import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthStore';
import { RackProvider } from '@/store/RackStore';
import { UIProvider } from '@/store/UIStore';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { FeedPage } from '@/pages/FeedPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

const router = createBrowserRouter([
  // Public
  { path: '/login', element: <LoginPage />, errorElement: <RouteErrorPage fullPage /> },

  // Everything else requires a session. Add Item is a modal inside the shell, so it's covered too.
  // UIProvider lives inside the router so its modals can navigate & link.
  {
    element: (
      <RequireAuth>
        <UIProvider>
          <AppShell />
        </UIProvider>
      </RequireAuth>
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
    <AuthProvider>
      <RackProvider>
        <RouterProvider router={router} />
      </RackProvider>
    </AuthProvider>
  );
}
