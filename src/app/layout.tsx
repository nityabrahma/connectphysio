import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/providers/app-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/providers/theme-provider';

export const metadata: Metadata = {
  title: 'TheraSuite',
  description: 'Patient Booking & Therapy Management App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <AuthProvider>{children}</AuthProvider>
          </AppProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
