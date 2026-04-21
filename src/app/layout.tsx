import type { Metadata } from 'next';
import { Space_Mono, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mateo Ríos — Creative Developer & Designer',
  description:
    'Portafolio de Mateo Ríos. Diseñador y desarrollador creativo especializado en interfaces premium, branding y experiencias digitales memorables.',
  keywords: [
    'portfolio',
    'creative developer',
    'designer',
    'UI/UX',
    'branding',
    'web design',
  ],
  authors: [{ name: 'Mateo Ríos' }],
  openGraph: {
    title: 'Mateo Ríos — Creative Developer & Designer',
    description:
      'Diseñador y desarrollador creativo con pasión por las interfaces que cuentan historias.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mateo Ríos — Creative Developer & Designer',
    description:
      'Diseñador y desarrollador creativo con pasión por las interfaces que cuentan historias.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${spaceMono.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
