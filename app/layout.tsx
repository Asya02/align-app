import '@/app/components/globals.css';
import { inter } from "@/app/components/fonts";
import Footer from '@/app/components/footer';

import type { Metadata } from "next";
import Script from 'next/script';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "AlignEval: Making Evals Easy, Fun, and Semi-Automated",
  description: "A prototype tool/game to help you look at your data, label it, evaluate output, and optimize evaluators.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'AlignEval: Making Evals Easy, Fun, and Semi-Automated',
    description: 'A prototype tool/game to help you look at your data, label it, evaluate output, and optimize evaluators.',
    url: 'https://aligneval.com',
    siteName: 'AlignEval',
    images: [{
      url: 'https://aligneval.com/og-image.jpg',
      secureUrl: 'https://aligneval.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AlignEval: Upload, Label, Evaluate, Optimize',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlignEval: Making Evals Easy, Fun, and Semi-Automated',
    description: 'A prototype tool/game to help you look at your data, label it, evaluate output, and optimize evaluators.',
    creator: '@eugeneyan',
    images: {
      url: 'https://aligneval.com/og-image.jpg',
      secureUrl: 'https://aligneval.com/og-image.jpg',
      alt: 'AlignEval: Upload, Label, Evaluate, Optimize',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen bg-white`}>
        <main className="flex-grow">
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center">
              <div className="text-lg">Loading...</div>
            </div>
          }>
            {children}
          </Suspense>
        </main>
        <Footer />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-44MQ54N7Q7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-44MQ54N7Q7');
          `}
        </Script>
      </body>
    </html>
  );
}
