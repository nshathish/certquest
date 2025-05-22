import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router';
import { Toaster } from 'sonner';

import AppLayout from '@app/layouts/AppLayout.tsx';

import { queryClient } from '@app/lib/queryClient.ts';
import Loader from '@app/shared/components/Loader.tsx';

const Home = lazy(() => import('@app/pages/Home.tsx'));
const About = lazy(() => import('@app/pages/About.tsx'));
const UploadImage = lazy(
  () => import('@app/features/image-upload/components/UploadImage.tsx'),
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadImage />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}
