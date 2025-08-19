'use client';

import { useAuth as useAuthProvider } from '@/providers/auth-provider';

// This is a wrapper hook to avoid client components directly importing the provider
// making it easier to manage dependencies and potential server/client component boundaries.
export const useAuth = () => {
  return useAuthProvider();
};
