'use client';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sateri Medical</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><text x='50' y='40' text-anchor='middle' font-family='sans-serif' font-size='25' font-weight='bold' fill='%2316a34a'>Sateri</text><text x='50' y='75' text-anchor='middle' font-family='sans-serif' font-size='25' font-weight='bold' fill='%23f97316'>Medical</text></svg>" />
      </head>
      <body className="antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
