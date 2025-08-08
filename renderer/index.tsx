import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { initializeLanguage, useLanguageStore } from './store/languageStore';

// Initialize language detection
initializeLanguage();

// Enable scroll restoration in the browser
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: 300000,
    },
  },
});

// Language-aware Query Client wrapper
const LanguageAwareQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLanguage } = useLanguageStore();

  useEffect(() => {
    // Invalidate all queries when language changes to force refetch
    queryClient.invalidateQueries();
  }, [currentLanguage]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <LanguageAwareQueryProvider>
      <RouterProvider router={router} />
    </LanguageAwareQueryProvider>
  </React.StrictMode>
);