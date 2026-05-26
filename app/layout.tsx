import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextPrint — Design Your Jersey",
  description: "Custom jersey designer powered by AI. Design your team jersey with NextPrint.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
