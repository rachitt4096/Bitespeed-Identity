import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiteSpeed Identity Demo",
  description: "Next.js demo UI for the identity reconciliation endpoint",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
