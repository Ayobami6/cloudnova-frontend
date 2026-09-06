import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CloudNova — Developer-First Cloud Infrastructure & Global Compute Platform",
  description: "Next-generation developer cloud: high-performance KVM droplets, managed databases, zero-egress NVMe & S3 storage, and global Anycast network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 min-h-screen selection:bg-blue-600/30 selection:text-blue-200 transition-colors duration-150">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
