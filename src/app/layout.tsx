import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where Our Paths Meet",
  description:
    "A cinematic scroll-driven story about the paths we never lived, the one we live now, and the one still imagined."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
