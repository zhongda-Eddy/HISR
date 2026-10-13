import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HISR — A little perspective for life's big questions",
  description:
    "Find new perspectives on relationships, career decisions, and life's uncertainties through history, philosophy, and literature.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
