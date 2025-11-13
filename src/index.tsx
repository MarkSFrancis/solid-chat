/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import { RouterProvider, createRouter } from '@tanstack/solid-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const root = document.getElementById('root')!;

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

render(() => <RouterProvider router={router} />, root);
