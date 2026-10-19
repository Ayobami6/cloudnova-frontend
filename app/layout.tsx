import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CloudNova — Developer-First Cloud Infrastructure & Global Compute Platform",
  description:
    "Next-generation developer cloud: high-performance KVM droplets, managed databases, zero-egress NVMe & S3 storage, and global Anycast network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0&display=swap"
        />
      </head>
      <body className="bg-[#F6F6F4] dark:bg-[#0F1115] text-[#1E1E1E] dark:text-[#F4F5F7] min-h-screen selection:bg-[#CFE0EC] selection:text-[#1E1E1E] dark:selection:bg-[#2563EB]/30 dark:selection:text-blue-100 transition-colors duration-150 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
