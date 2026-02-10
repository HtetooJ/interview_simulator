import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Practice - Waiter Interview Prep",
  description: "Practice tool for Myanmar youth preparing for waiter interviews in Dubai",
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
