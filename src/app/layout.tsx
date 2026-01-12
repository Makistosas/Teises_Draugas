import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Teisės Draugas - Jūsų teisinis pagalbininkas',
  description:
    'AI pagalbininkas Lietuvos civiliniams ginčams. Automatizuota bylų analizė, pretenzijų rašymas ir teismo dokumentų ruošimas.',
  keywords: [
    'teisinis pagalbininkas',
    'civiliniai ginčai',
    'Lietuva',
    'pretenzija',
    'teismo įsakymas',
    'Vinted ginčai',
    'nuomos ginčai',
  ],
  authors: [{ name: 'Teisės Draugas' }],
  openGraph: {
    title: 'Teisės Draugas - Jūsų teisinis pagalbininkas',
    description: 'AI pagalbininkas Lietuvos civiliniams ginčams iki 5000 EUR',
    locale: 'lt_LT',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
