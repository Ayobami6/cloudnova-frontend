import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CloudNova — Infrastructure & Reseller Console",
  description: "Modern calm cloud management console for compute droplets, managed databases, NVMe volumes, S3 spaces, and domains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090A0F] text-slate-100 min-h-screen selection:bg-blue-600/30 selection:text-blue-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
