import '@/app/components/globals.css';
import { inter } from "@/app/components/fonts";
import Footer from '@/app/components/footer';

import type { Metadata } from "next";
import Script from 'next/script';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "ALIGN Eval: Assisted Labeling to Improve GeneratioN of Evals",
  description: "A prototype tool to help you label data, evaluate output, and optimize prompts.",
  icons: {
    icon: '/favicon.svg',
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
      </body>
    </html>
  );
}
